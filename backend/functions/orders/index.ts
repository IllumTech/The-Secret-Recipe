import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ORDERS_TABLE = process.env.ORDERS_TABLE!;

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

    // GET /orders - List all orders
    if (httpMethod === 'GET' && path === '/orders') {
      return await listOrders();
    }

    // POST /orders - Create order
    if (httpMethod === 'POST' && path === '/orders') {
      const body = JSON.parse(event.body || '{}');
      return await createOrder(body);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};

// List all orders
async function listOrders(): Promise<APIGatewayProxyResult> {
  try {
    const command = new ScanCommand({
      TableName: ORDERS_TABLE
    });

    const response = await docClient.send(command);
    const orders = response.Items || [];

    // Sort by date (newest first)
    orders.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return successResponse(200, orders);
  } catch (error) {
    console.error('Error listing orders:', error);
    return errorResponse(500, 'Failed to list orders');
  }
}

// Create new order
async function createOrder(data: any): Promise<APIGatewayProxyResult> {
  try {
    // Validation
    if (!data.customerName || !data.customerEmail || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return errorResponse(400, 'Missing required fields: customerName, customerEmail, items');
    }

    if (!data.deliveryAddress || !data.deliveryAddress.street || !data.deliveryAddress.city) {
      return errorResponse(400, 'Missing required delivery address fields');
    }

    // Generate order number (e.g., ORD-20231215-1234)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Calculate total
    const total = data.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const order = {
      id: uuidv4(),
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '',
      deliveryAddress: {
        street: data.deliveryAddress.street,
        city: data.deliveryAddress.city,
        state: data.deliveryAddress.state || '',
        zipCode: data.deliveryAddress.zipCode || ''
      },
      items: data.items.map((item: any) => ({
        product: {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || '🍦',
          category: item.category || 'helado',
          isActive: true,
          isOnPromotion: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        quantity: item.quantity
      })),
      totalAmount: parseFloat(total.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: ORDERS_TABLE,
      Item: order
    });

    await docClient.send(command);

    return successResponse(201, order);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse(500, 'Failed to create order');
  }
}
