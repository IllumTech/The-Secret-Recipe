import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ORDERS_TABLE = process.env.ORDERS_TABLE!;

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
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

    // GET /calendar/orders - Get orders grouped by delivery date
    if (httpMethod === 'GET' && path === '/calendar/orders') {
      const startDate = event.queryStringParameters?.startDate;
      const endDate = event.queryStringParameters?.endDate;
      return await getCalendarOrders(startDate, endDate);
    }

    // GET /calendar/orders/{date} - Get orders for specific date
    if (httpMethod === 'GET' && path.startsWith('/calendar/orders/')) {
      const date = event.pathParameters?.date;
      if (!date) {
        return errorResponse(400, 'Date parameter is required');
      }
      return await getOrdersByDate(date);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};

// Get orders grouped by delivery date
async function getCalendarOrders(startDate?: string, endDate?: string): Promise<APIGatewayProxyResult> {
  try {
    let orders: any[] = [];

    // If date range is provided, we could optimize with GSI queries
    // For now, scan all orders and filter
    const scanCommand = new ScanCommand({
      TableName: ORDERS_TABLE
    });

    const response = await docClient.send(scanCommand);
    orders = response.Items || [];

    // Filter orders that have deliveryDate
    orders = orders.filter(order => order.deliveryDate);

    // Apply date range filter if provided
    if (startDate) {
      orders = orders.filter(order => order.deliveryDate >= startDate);
    }
    if (endDate) {
      orders = orders.filter(order => order.deliveryDate <= endDate);
    }

    // Group orders by deliveryDate
    const groupedOrders: { [date: string]: any[] } = {};
    const orderCounts: { [date: string]: number } = {};

    for (const order of orders) {
      const date = order.deliveryDate;
      if (!groupedOrders[date]) {
        groupedOrders[date] = [];
        orderCounts[date] = 0;
      }
      groupedOrders[date].push(order);
      orderCounts[date]++;
    }

    // Format response with aggregated data
    const result = {
      dates: Object.keys(groupedOrders).sort(),
      ordersByDate: groupedOrders,
      orderCounts: orderCounts,
      totalOrders: orders.length
    };

    return successResponse(200, result);
  } catch (error) {
    console.error('Error getting calendar orders:', error);
    return errorResponse(500, 'Failed to get calendar orders');
  }
}

// Get orders for a specific date
async function getOrdersByDate(date: string): Promise<APIGatewayProxyResult> {
  try {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return errorResponse(400, 'Invalid date format. Use YYYY-MM-DD');
    }

    // Query using the deliveryDate GSI
    const queryCommand = new QueryCommand({
      TableName: ORDERS_TABLE,
      IndexName: 'deliveryDate-index',
      KeyConditionExpression: 'deliveryDate = :date',
      ExpressionAttributeValues: {
        ':date': date
      }
    });

    const response = await docClient.send(queryCommand);
    const orders = response.Items || [];

    // Sort by creation time (newest first)
    orders.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return successResponse(200, {
      date,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error getting orders by date:', error);
    return errorResponse(500, 'Failed to get orders by date');
  }
}
