import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const WASTE_TABLE = process.env.WASTE_TABLE!;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// Error response helper
const errorResponse = (statusCode: number, message: string): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: JSON.stringify({ error: message })
});

// Success response helper
const successResponse = (statusCode: number, data: any): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: JSON.stringify(data)
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const httpMethod = event.httpMethod;
  const path = event.path;

  try {
    // Handle OPTIONS for CORS preflight
    if (httpMethod === 'OPTIONS') {
      return successResponse(200, {});
    }

    // POST /waste - Create waste entry
    if (httpMethod === 'POST' && path === '/waste') {
      const body = JSON.parse(event.body || '{}');
      return await createWasteEntry(body);
    }

    // GET /waste - List waste entries
    if (httpMethod === 'GET' && path === '/waste') {
      const queryParams = event.queryStringParameters || {};
      return await listWasteEntries(queryParams);
    }

    // GET /waste/report - Monthly waste report
    if (httpMethod === 'GET' && path === '/waste/report') {
      const queryParams = event.queryStringParameters || {};
      return await getWasteReport(queryParams);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};

// Create waste entry
async function createWasteEntry(data: any): Promise<APIGatewayProxyResult> {
  try {
    // Validate required fields
    if (!data.productId || !data.quantity || !data.reason || !data.timestamp) {
      return errorResponse(400, 'Missing required fields: productId, quantity, reason, timestamp');
    }

    // Validate quantity
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return errorResponse(400, 'Quantity must be a positive integer');
    }

    // Validate reason
    const validReasons = ['expired', 'damaged', 'other'];
    if (!validReasons.includes(data.reason)) {
      return errorResponse(400, 'Reason must be one of: expired, damaged, other');
    }

    // Get product to retrieve production cost and name
    const productCommand = new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: data.productId }
    });

    const productResponse = await docClient.send(productCommand);

    if (!productResponse.Item) {
      return errorResponse(404, 'Product not found');
    }

    const product = productResponse.Item;

    // Check if product has production cost
    if (product.productionCost === undefined) {
      return errorResponse(400, 'Product does not have production cost defined');
    }

    // Calculate financial impact
    const financialImpact = quantity * product.productionCost;

    // Create waste entry
    const wasteEntry = {
      id: uuidv4(),
      productId: data.productId,
      productName: product.name,
      quantity: quantity,
      reason: data.reason,
      notes: data.notes || '',
      productionCost: product.productionCost,
      financialImpact: financialImpact,
      timestamp: data.timestamp,
      recordedBy: data.recordedBy || 'admin'
    };

    // Store waste entry
    const putCommand = new PutCommand({
      TableName: WASTE_TABLE,
      Item: wasteEntry
    });

    await docClient.send(putCommand);

    // Update product stock quantity (reduce by waste quantity)
    if (product.stockQuantity !== undefined) {
      const newStockQuantity = Math.max(0, product.stockQuantity - quantity);
      
      const updateCommand = new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id: data.productId },
        UpdateExpression: 'SET stockQuantity = :newStock, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':newStock': newStockQuantity,
          ':updatedAt': new Date().toISOString()
        }
      });

      await docClient.send(updateCommand);
    }

    return successResponse(201, wasteEntry);
  } catch (error) {
    console.error('Error creating waste entry:', error);
    return errorResponse(500, 'Failed to create waste entry');
  }
}

// List waste entries
async function listWasteEntries(queryParams: any): Promise<APIGatewayProxyResult> {
  try {
    const command = new ScanCommand({
      TableName: WASTE_TABLE
    });

    const response = await docClient.send(command);
    let wasteEntries = response.Items || [];

    // Sort by timestamp descending (newest first)
    wasteEntries.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Optional date filtering
    if (queryParams.startDate || queryParams.endDate) {
      const startDate = queryParams.startDate ? new Date(queryParams.startDate) : new Date(0);
      const endDate = queryParams.endDate ? new Date(queryParams.endDate) : new Date();

      wasteEntries = wasteEntries.filter((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    return successResponse(200, wasteEntries);
  } catch (error) {
    console.error('Error listing waste entries:', error);
    return errorResponse(500, 'Failed to list waste entries');
  }
}

// Get monthly waste report
async function getWasteReport(queryParams: any): Promise<APIGatewayProxyResult> {
  try {
    // Get month and year from query params, default to current month
    const now = new Date();
    const month = queryParams.month ? parseInt(queryParams.month) : now.getMonth() + 1;
    const year = queryParams.year ? parseInt(queryParams.year) : now.getFullYear();

    // Validate month and year
    if (month < 1 || month > 12) {
      return errorResponse(400, 'Month must be between 1 and 12');
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all waste entries
    const command = new ScanCommand({
      TableName: WASTE_TABLE
    });

    const response = await docClient.send(command);
    const allWasteEntries = response.Items || [];

    // Filter entries for the specified month
    const monthWasteEntries = allWasteEntries.filter((entry: any) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate total waste cost
    const totalWasteCost = monthWasteEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.financialImpact || 0);
    }, 0);

    // Group by product
    const wasteByProduct: Record<string, any> = {};
    monthWasteEntries.forEach((entry: any) => {
      if (!wasteByProduct[entry.productId]) {
        wasteByProduct[entry.productId] = {
          productId: entry.productId,
          productName: entry.productName,
          totalQuantity: 0,
          totalCost: 0,
          entries: []
        };
      }
      wasteByProduct[entry.productId].totalQuantity += entry.quantity;
      wasteByProduct[entry.productId].totalCost += entry.financialImpact;
      wasteByProduct[entry.productId].entries.push(entry);
    });

    // Calculate total production cost for the month (for percentage calculation)
    // This would require order data, so we'll return it as optional
    const report = {
      month,
      year,
      totalWasteCost,
      wasteEntryCount: monthWasteEntries.length,
      wasteByProduct: Object.values(wasteByProduct),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return successResponse(200, report);
  } catch (error) {
    console.error('Error generating waste report:', error);
    return errorResponse(500, 'Failed to generate waste report');
  }
}
