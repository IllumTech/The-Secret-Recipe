import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const PURCHASES_TABLE = process.env.PURCHASES_TABLE!;

// Valid purchase categories
const VALID_CATEGORIES = ['ingredientes', 'empaque', 'decoracion', 'equipo', 'otros'] as const;
type PurchaseCategory = typeof VALID_CATEGORIES[number];

// Purchase interfaces
interface Purchase {
  id: string;
  amount: number;
  purchaseDate: string;
  description: string;
  category: PurchaseCategory;
  receiptImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePurchaseInput {
  amount: number;
  purchaseDate: string;
  description: string;
  category: string;
  receiptImageUrl?: string;
}

interface UpdatePurchaseInput {
  amount?: number;
  purchaseDate?: string;
  description?: string;
  category?: string;
  receiptImageUrl?: string;
}

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
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


// Validation helper for purchase input
export function validatePurchaseInput(data: CreatePurchaseInput): string | null {
  // Validate amount is positive
  if (data.amount === undefined || data.amount === null || data.amount <= 0) {
    return 'El monto debe ser un número positivo mayor a cero';
  }

  // Validate date is not future
  if (!data.purchaseDate) {
    return 'La fecha de compra es requerida';
  }
  const purchaseDate = new Date(data.purchaseDate);
  if (isNaN(purchaseDate.getTime())) {
    return 'La fecha de compra no es válida';
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (purchaseDate > today) {
    return 'La fecha de compra no puede ser futura';
  }

  // Validate description is not empty
  if (!data.description || data.description.trim().length === 0) {
    return 'La descripción es requerida';
  }

  // Validate category is valid
  if (!data.category || !VALID_CATEGORIES.includes(data.category as PurchaseCategory)) {
    return 'La categoría no es válida';
  }

  return null;
}

// Validation helper for update input
function validateUpdateInput(data: UpdatePurchaseInput): string | null {
  if (data.amount !== undefined && data.amount <= 0) {
    return 'El monto debe ser un número positivo mayor a cero';
  }

  if (data.purchaseDate !== undefined) {
    const purchaseDate = new Date(data.purchaseDate);
    if (isNaN(purchaseDate.getTime())) {
      return 'La fecha de compra no es válida';
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (purchaseDate > today) {
      return 'La fecha de compra no puede ser futura';
    }
  }

  if (data.description !== undefined && data.description.trim().length === 0) {
    return 'La descripción es requerida';
  }

  if (data.category !== undefined && !VALID_CATEGORIES.includes(data.category as PurchaseCategory)) {
    return 'La categoría no es válida';
  }

  return null;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const httpMethod = event.httpMethod;
  const path = event.path;
  const pathParameters = event.pathParameters;

  try {
    // Handle OPTIONS for CORS preflight
    if (httpMethod === 'OPTIONS') {
      return successResponse(200, {});
    }

    // POST /purchases - Create purchase
    if (httpMethod === 'POST' && path === '/purchases') {
      const body = JSON.parse(event.body || '{}');
      return await createPurchase(body);
    }

    // GET /purchases - List purchases
    if (httpMethod === 'GET' && path === '/purchases') {
      const queryParams = event.queryStringParameters || {};
      return await listPurchases(queryParams);
    }

    // GET /purchases/report - Get monthly report
    if (httpMethod === 'GET' && path === '/purchases/report') {
      const queryParams = event.queryStringParameters || {};
      return await getPurchaseReport(queryParams);
    }

    // GET /purchases/{id} - Get single purchase
    if (httpMethod === 'GET' && pathParameters?.id) {
      return await getPurchase(pathParameters.id);
    }

    // PUT /purchases/{id} - Update purchase
    if (httpMethod === 'PUT' && pathParameters?.id) {
      const body = JSON.parse(event.body || '{}');
      return await updatePurchase(pathParameters.id, body);
    }

    // DELETE /purchases/{id} - Delete purchase
    if (httpMethod === 'DELETE' && pathParameters?.id) {
      return await deletePurchase(pathParameters.id);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};


// Create purchase
async function createPurchase(data: CreatePurchaseInput): Promise<APIGatewayProxyResult> {
  try {
    // Validate input
    const validationError = validatePurchaseInput(data);
    if (validationError) {
      return errorResponse(400, validationError);
    }

    const now = new Date().toISOString();
    const purchase: Purchase = {
      id: uuidv4(),
      amount: data.amount,
      purchaseDate: data.purchaseDate,
      description: data.description.trim(),
      category: data.category as PurchaseCategory,
      receiptImageUrl: data.receiptImageUrl,
      createdAt: now,
      updatedAt: now
    };

    const putCommand = new PutCommand({
      TableName: PURCHASES_TABLE,
      Item: purchase
    });

    await docClient.send(putCommand);

    return successResponse(201, purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    return errorResponse(500, 'Failed to create purchase');
  }
}

// List purchases with optional filters
async function listPurchases(queryParams: Record<string, string | undefined>): Promise<APIGatewayProxyResult> {
  try {
    const command = new ScanCommand({
      TableName: PURCHASES_TABLE
    });

    const response = await docClient.send(command);
    let purchases = response.Items || [];

    // Apply filters
    const { startDate, endDate, category } = queryParams;

    if (startDate) {
      const start = new Date(startDate);
      purchases = purchases.filter((p: any) => new Date(p.purchaseDate) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      purchases = purchases.filter((p: any) => new Date(p.purchaseDate) <= end);
    }

    if (category && VALID_CATEGORIES.includes(category as PurchaseCategory)) {
      purchases = purchases.filter((p: any) => p.category === category);
    }

    // Sort by purchaseDate descending (newest first)
    purchases.sort((a: any, b: any) => {
      return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    });

    return successResponse(200, purchases);
  } catch (error) {
    console.error('Error listing purchases:', error);
    return errorResponse(500, 'Failed to list purchases');
  }
}

// Get single purchase by ID
async function getPurchase(id: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new GetCommand({
      TableName: PURCHASES_TABLE,
      Key: { id }
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return errorResponse(404, 'Compra no encontrada');
    }

    return successResponse(200, response.Item);
  } catch (error) {
    console.error('Error getting purchase:', error);
    return errorResponse(500, 'Failed to get purchase');
  }
}


// Update purchase
async function updatePurchase(id: string, data: UpdatePurchaseInput): Promise<APIGatewayProxyResult> {
  try {
    // Check if purchase exists
    const getCommand = new GetCommand({
      TableName: PURCHASES_TABLE,
      Key: { id }
    });

    const existingResponse = await docClient.send(getCommand);

    if (!existingResponse.Item) {
      return errorResponse(404, 'Compra no encontrada');
    }

    // Validate update input
    const validationError = validateUpdateInput(data);
    if (validationError) {
      return errorResponse(400, validationError);
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.amount !== undefined) {
      updateExpressions.push('#amount = :amount');
      expressionAttributeNames['#amount'] = 'amount';
      expressionAttributeValues[':amount'] = data.amount;
    }

    if (data.purchaseDate !== undefined) {
      updateExpressions.push('#purchaseDate = :purchaseDate');
      expressionAttributeNames['#purchaseDate'] = 'purchaseDate';
      expressionAttributeValues[':purchaseDate'] = data.purchaseDate;
    }

    if (data.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = data.description.trim();
    }

    if (data.category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = data.category;
    }

    if (data.receiptImageUrl !== undefined) {
      updateExpressions.push('#receiptImageUrl = :receiptImageUrl');
      expressionAttributeNames['#receiptImageUrl'] = 'receiptImageUrl';
      expressionAttributeValues[':receiptImageUrl'] = data.receiptImageUrl;
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: PURCHASES_TABLE,
      Key: { id },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const updateResponse = await docClient.send(updateCommand);

    return successResponse(200, updateResponse.Attributes);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return errorResponse(500, 'Failed to update purchase');
  }
}

// Delete purchase
async function deletePurchase(id: string): Promise<APIGatewayProxyResult> {
  try {
    // Check if purchase exists
    const getCommand = new GetCommand({
      TableName: PURCHASES_TABLE,
      Key: { id }
    });

    const existingResponse = await docClient.send(getCommand);

    if (!existingResponse.Item) {
      return errorResponse(404, 'Compra no encontrada');
    }

    const deleteCommand = new DeleteCommand({
      TableName: PURCHASES_TABLE,
      Key: { id }
    });

    await docClient.send(deleteCommand);

    return successResponse(200, { message: 'Compra eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return errorResponse(500, 'Failed to delete purchase');
  }
}


// Get monthly purchase report
async function getPurchaseReport(queryParams: Record<string, string | undefined>): Promise<APIGatewayProxyResult> {
  try {
    // Get month and year from query params, default to current month
    const now = new Date();
    const month = queryParams.month ? parseInt(queryParams.month) : now.getMonth() + 1;
    const year = queryParams.year ? parseInt(queryParams.year) : now.getFullYear();

    // Validate month and year
    if (month < 1 || month > 12) {
      return errorResponse(400, 'El mes debe estar entre 1 y 12');
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all purchases
    const command = new ScanCommand({
      TableName: PURCHASES_TABLE
    });

    const response = await docClient.send(command);
    const allPurchases = response.Items || [];

    // Filter purchases for the specified month
    const monthPurchases = allPurchases.filter((purchase: any) => {
      const purchaseDate = new Date(purchase.purchaseDate);
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });

    // Calculate total amount
    const totalAmount = monthPurchases.reduce((sum: number, purchase: any) => {
      return sum + (purchase.amount || 0);
    }, 0);

    // Group by category
    const byCategory: Record<string, { totalAmount: number; count: number }> = {};
    
    for (const category of VALID_CATEGORIES) {
      byCategory[category] = { totalAmount: 0, count: 0 };
    }

    monthPurchases.forEach((purchase: any) => {
      const cat = purchase.category as PurchaseCategory;
      if (byCategory[cat]) {
        byCategory[cat].totalAmount += purchase.amount || 0;
        byCategory[cat].count += 1;
      }
    });

    // Convert to array format
    const byCategoryArray = VALID_CATEGORIES.map(category => ({
      category,
      totalAmount: byCategory[category].totalAmount,
      count: byCategory[category].count
    })).filter(item => item.count > 0);

    const report = {
      month,
      year,
      totalAmount,
      purchaseCount: monthPurchases.length,
      byCategory: byCategoryArray,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return successResponse(200, report);
  } catch (error) {
    console.error('Error generating purchase report:', error);
    return errorResponse(500, 'Failed to generate purchase report');
  }
}
