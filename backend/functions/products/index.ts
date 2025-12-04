import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;

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

    // GET /products - List all products
    if (httpMethod === 'GET' && path === '/products') {
      return await listProducts();
    }

    // GET /products/{id} - Get single product
    if (httpMethod === 'GET' && pathParameters?.id) {
      return await getProduct(pathParameters.id);
    }

    // POST /products - Create product
    if (httpMethod === 'POST' && path === '/products') {
      const body = JSON.parse(event.body || '{}');
      return await createProduct(body);
    }

    // PUT /products/{id} - Update product
    if (httpMethod === 'PUT' && pathParameters?.id) {
      const body = JSON.parse(event.body || '{}');
      return await updateProduct(pathParameters.id, body);
    }

    // DELETE /products/{id} - Delete product (soft delete)
    if (httpMethod === 'DELETE' && pathParameters?.id) {
      return await deleteProduct(pathParameters.id);
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};

// List all active products
async function listProducts(): Promise<APIGatewayProxyResult> {
  try {
    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE
    });

    const response = await docClient.send(command);
    const products = (response.Items || []).filter(item => item.isActive !== false);

    return successResponse(200, products);
  } catch (error) {
    console.error('Error listing products:', error);
    return errorResponse(500, 'Failed to list products');
  }
}

// Get single product by ID
async function getProduct(id: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id }
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return errorResponse(404, 'Product not found');
    }

    if (response.Item.isActive === false) {
      return errorResponse(404, 'Product not found');
    }

    return successResponse(200, response.Item);
  } catch (error) {
    console.error('Error getting product:', error);
    return errorResponse(500, 'Failed to get product');
  }
}

// Create new product
async function createProduct(data: any): Promise<APIGatewayProxyResult> {
  try {
    // Validation
    if (!data.name || !data.category || !data.price) {
      return errorResponse(400, 'Missing required fields: name, category, price');
    }

    // Promotion validation
    if (data.isOnPromotion) {
      if (!data.promotionalPrice) {
        return errorResponse(400, 'El precio promocional es requerido cuando la promoción está activa');
      }
      const price = parseFloat(data.price);
      const promotionalPrice = parseFloat(data.promotionalPrice);
      
      if (promotionalPrice < 0) {
        return errorResponse(400, 'El precio promocional debe ser mayor a 0');
      }
      if (promotionalPrice >= price) {
        return errorResponse(400, 'El precio promocional debe ser menor al precio original');
      }
    }

    const product: any = {
      id: uuidv4(),
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      description: data.description || '',
      image: data.image || '🍦',
      imageUrl: data.imageUrl || '',
      isActive: true,
      isOnPromotion: data.isOnPromotion || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Only add promotionalPrice if promotion is enabled
    if (data.isOnPromotion && data.promotionalPrice) {
      product.promotionalPrice = parseFloat(data.promotionalPrice);
    }

    const command = new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: product
    });

    await docClient.send(command);

    return successResponse(201, product);
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse(500, 'Failed to create product');
  }
}

// Update existing product
async function updateProduct(id: string, data: any): Promise<APIGatewayProxyResult> {
  try {
    // First check if product exists
    const getCommand = new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id }
    });

    const existing = await docClient.send(getCommand);

    if (!existing.Item || existing.Item.isActive === false) {
      return errorResponse(404, 'Product not found');
    }

    // Promotion validation
    if (data.isOnPromotion !== undefined) {
      if (data.isOnPromotion) {
        if (!data.promotionalPrice) {
          return errorResponse(400, 'El precio promocional es requerido cuando la promoción está activa');
        }
        const price = data.price !== undefined ? parseFloat(data.price) : existing.Item.price;
        const promotionalPrice = parseFloat(data.promotionalPrice);
        
        if (promotionalPrice < 0) {
          return errorResponse(400, 'El precio promocional debe ser mayor a 0');
        }
        if (promotionalPrice >= price) {
          return errorResponse(400, 'El precio promocional debe ser menor al precio original');
        }
      }
    }

    // Build update expression
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (data.name !== undefined) updates.name = data.name;
    if (data.category !== undefined) updates.category = data.category;
    if (data.price !== undefined) updates.price = parseFloat(data.price);
    if (data.description !== undefined) updates.description = data.description;
    if (data.image !== undefined) updates.image = data.image;
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
    if (data.isOnPromotion !== undefined) {
      updates.isOnPromotion = data.isOnPromotion;
      if (data.isOnPromotion && data.promotionalPrice !== undefined) {
        updates.promotionalPrice = parseFloat(data.promotionalPrice);
      } else if (!data.isOnPromotion) {
        // When disabling promotion, remove promotional price
        updates.promotionalPrice = null;
      }
    }

    const updateExpression = 'SET ' + Object.keys(updates).map((key, index) => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {} as Record<string, string>);
    const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
      acc[`:${key}`] = updates[key];
      return acc;
    }, {} as Record<string, any>);

    const command = new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);

    return successResponse(200, response.Attributes);
  } catch (error) {
    console.error('Error updating product:', error);
    return errorResponse(500, 'Failed to update product');
  }
}

// Delete product (soft delete)
async function deleteProduct(id: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id },
      UpdateExpression: 'SET isActive = :false, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':false': false,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    await docClient.send(command);

    return successResponse(200, { message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse(500, 'Failed to delete product');
  }
}
