import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const ORDERS_TABLE = process.env.ORDERS_TABLE!;
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

    // Validate deliveryDate if provided (must be in future)
    if (data.deliveryDate) {
      const deliveryDate = new Date(data.deliveryDate);
      const now = new Date();
      if (deliveryDate <= now) {
        return errorResponse(400, 'Delivery date must be in the future');
      }
    }

    // Fetch product details and validate stock/lead time
    const productDetails: any[] = [];
    for (const item of data.items) {
      const getCommand = new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id: item.id }
      });

      const result = await docClient.send(getCommand);
      if (!result.Item) {
        return errorResponse(400, `Product not found: ${item.id}`);
      }

      const product = result.Item;
      productDetails.push({ ...product, orderQuantity: item.quantity });

      // Check stock availability
      if (product.stockQuantity !== undefined) {
        if (product.stockQuantity < item.quantity) {
          return errorResponse(400, `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
        }
      }

      // Validate lead time if deliveryDate is provided
      if (data.deliveryDate) {
        const leadTimeHours = product.leadTimeHours || 24; // Default 24 hours
        const deliveryDate = new Date(data.deliveryDate);
        const now = new Date();
        const hoursDifference = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDifference < leadTimeHours) {
          return errorResponse(400, `Product "${product.name}" requires at least ${leadTimeHours} hours notice. Please select a later delivery date.`);
        }
      }
    }

    // Generate order number (e.g., ORD-20231215-1234)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Calculate total
    const total = data.items.reduce((sum: number, item: any) => {
      const product = productDetails.find(p => p.id === item.id);
      const price = product?.isOnPromotion && product?.promotionalPrice 
        ? product.promotionalPrice 
        : product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Create order object
    const order: any = {
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
      items: data.items.map((item: any) => {
        const product = productDetails.find(p => p.id === item.id);
        const price = product?.isOnPromotion && product?.promotionalPrice 
          ? product.promotionalPrice 
          : product?.price || 0;
        return {
          product: {
            id: product.id,
            name: product.name,
            price: price,
            image: product.image || '🍦',
            imageUrl: product.imageUrl,
            category: product.category || 'helado',
            isActive: product.isActive,
            isOnPromotion: product.isOnPromotion || false,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          },
          quantity: item.quantity
        };
      }),
      totalAmount: parseFloat(total.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add optional fields if provided
    if (data.deliveryDate) {
      order.deliveryDate = data.deliveryDate;
    }
    if (data.deliveryTime) {
      order.deliveryTime = data.deliveryTime;
    }
    if (data.productionNotes) {
      order.productionNotes = data.productionNotes;
    }

    // Save order to database
    const putCommand = new PutCommand({
      TableName: ORDERS_TABLE,
      Item: order
    });

    await docClient.send(putCommand);

    // Update stock quantities for each product
    for (const productDetail of productDetails) {
      if (productDetail.stockQuantity !== undefined) {
        const updateCommand = new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { id: productDetail.id },
          UpdateExpression: 'SET stockQuantity = stockQuantity - :quantity',
          ExpressionAttributeValues: {
            ':quantity': productDetail.orderQuantity,
            ':zero': 0
          },
          ConditionExpression: 'stockQuantity >= :quantity AND stockQuantity >= :zero'
        });

        try {
          await docClient.send(updateCommand);
        } catch (error: any) {
          // If condition fails, it means stock was reduced by another order concurrently
          if (error.name === 'ConditionalCheckFailedException') {
            return errorResponse(409, `Stock for ${productDetail.name} was updated by another order. Please try again.`);
          }
          throw error;
        }
      }
    }

    return successResponse(201, order);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse(500, 'Failed to create order');
  }
}
