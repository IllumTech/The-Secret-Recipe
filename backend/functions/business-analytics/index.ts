import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
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

    // GET /analytics/profitability - Get profitability rankings
    if (httpMethod === 'GET' && path === '/analytics/profitability') {
      return await getProfitabilityRankings();
    }

    // POST /analytics/demand-forecast - Request AI demand prediction
    if (httpMethod === 'POST' && path === '/analytics/demand-forecast') {
      return await getDemandForecast();
    }

    // POST /analytics/price-recommendations - Request AI price suggestions
    if (httpMethod === 'POST' && path === '/analytics/price-recommendations') {
      return await getPriceRecommendations();
    }

    return errorResponse(404, 'Route not found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal server error');
  }
};

// Interface definitions
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  isOnPromotion: boolean;
  promotionalPrice?: number;
  productionCost?: number;
  stockQuantity?: number;
  minStockAlert?: number;
  leadTimeHours?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductWithMetrics extends Product {
  contributionMargin: number;
  effectivePrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveryDate?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

// GET /analytics/profitability
async function getProfitabilityRankings(): Promise<APIGatewayProxyResult> {
  try {
    // Query all products from DynamoDB
    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE
    });

    const response = await docClient.send(command);
    const products = (response.Items || []) as Product[];

    // Filter products with production cost data and calculate margins
    const productsWithMetrics: ProductWithMetrics[] = products
      .filter(product => product.productionCost !== undefined && product.productionCost !== null)
      .map(product => {
        // Determine effective price (promotional if on promotion, else regular)
        const effectivePrice = product.isOnPromotion && product.promotionalPrice 
          ? product.promotionalPrice 
          : product.price;

        // Calculate contribution margin: (price - cost) / price * 100
        const contributionMargin = ((effectivePrice - product.productionCost!) / effectivePrice) * 100;

        return {
          ...product,
          effectivePrice,
          contributionMargin
        };
      });

    // Sort by contribution margin descending (highest to lowest)
    productsWithMetrics.sort((a, b) => b.contributionMargin - a.contributionMargin);

    return successResponse(200, {
      products: productsWithMetrics,
      count: productsWithMetrics.length
    });
  } catch (error) {
    console.error('Error getting profitability rankings:', error);
    return errorResponse(500, 'Failed to get profitability rankings');
  }
}

// POST /analytics/demand-forecast
async function getDemandForecast(): Promise<APIGatewayProxyResult> {
  try {
    // Query Orders table for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const command = new ScanCommand({
      TableName: ORDERS_TABLE
    });

    const response = await docClient.send(command);
    const allOrders = (response.Items || []) as Order[];

    // Filter orders from last 30 days
    const recentOrders = allOrders.filter(order => {
      return order.createdAt >= thirtyDaysAgoISO;
    });

    // Check if we have sufficient data (at least 7 days of history)
    if (recentOrders.length === 0) {
      return errorResponse(400, 'Insufficient order history. At least 7 days of data required for accurate forecasting.');
    }

    // Check date range of orders
    const orderDates = recentOrders.map(order => new Date(order.createdAt).getTime());
    const oldestOrder = Math.min(...orderDates);
    const newestOrder = Math.max(...orderDates);
    const daysDifference = (newestOrder - oldestOrder) / (1000 * 60 * 60 * 24);

    if (daysDifference < 7) {
      return errorResponse(400, `Insufficient order history. At least 7 days of data required for accurate forecasting. Current data spans ${Math.round(daysDifference)} days.`);
    }

    // Aggregate order data by product
    const orderDataByProduct: Record<string, any> = {};
    
    recentOrders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) {
        console.warn(`Order ${order.id} has invalid items structure`);
        return;
      }

      order.items.forEach(item => {
        // Handle both old and new order structures
        const product = item.product || item;
        
        if (!product || !product.id || !product.name) {
          console.warn(`Invalid product data in order ${order.id}:`, item);
          return;
        }

        const productId = product.id;
        const productName = product.name;
        const quantity = item.quantity || 1;
        const orderDate = order.createdAt.split('T')[0]; // Get date part only

        if (!orderDataByProduct[productId]) {
          orderDataByProduct[productId] = {
            productId,
            productName,
            ordersByDate: {}
          };
        }

        if (!orderDataByProduct[productId].ordersByDate[orderDate]) {
          orderDataByProduct[productId].ordersByDate[orderDate] = 0;
        }

        orderDataByProduct[productId].ordersByDate[orderDate] += quantity;
      });
    });

    // Format data for Bedrock prompt
    const orderHistory = Object.values(orderDataByProduct).map((productData: any) => ({
      productId: productData.productId,
      productName: productData.productName,
      dailyOrders: Object.entries(productData.ordersByDate).map(([date, quantity]) => ({
        date,
        quantity
      }))
    }));

    // Prepare Bedrock prompt
    const prompt = `Eres un analista de negocios para una panadería. Analiza el siguiente historial de pedidos de los últimos 30 días y predice la demanda de cada producto para los próximos 7 días.

Historial de Pedidos:
${JSON.stringify(orderHistory, null, 2)}

Proporciona tu pronóstico en formato JSON:
{
  "forecast": [
    {"product": "Nombre del Producto", "day": "2024-01-15", "quantity": 10},
    ...
  ]
}

Solo devuelve el objeto JSON, sin texto adicional.`;

    // Invoke Bedrock with Claude 3 Sonnet
    const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
    
    const bedrockCommand = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const bedrockResponse = await bedrockClient.send(bedrockCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    
    // Extract the text content from Claude's response
    const responseText = responseBody.content[0].text;
    
    // Parse JSON from response
    let forecastData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecastData = JSON.parse(jsonMatch[0]);
      } else {
        forecastData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Bedrock response:', parseError);
      console.error('Response text:', responseText);
      return errorResponse(500, 'Failed to parse AI forecast response');
    }

    return successResponse(200, forecastData);
  } catch (error: any) {
    console.error('Error getting demand forecast:', error);
    
    // Handle Bedrock-specific errors
    if (error.name === 'ThrottlingException') {
      return errorResponse(503, 'AI service temporarily unavailable due to high demand. Please try again later.');
    }
    
    if (error.name === 'TimeoutError' || error.$metadata?.httpStatusCode === 504) {
      return errorResponse(504, 'Request took too long. Please try again with a shorter date range.');
    }

    return errorResponse(503, 'AI service temporarily unavailable. Please try again later.');
  }
}

// POST /analytics/price-recommendations
async function getPriceRecommendations(): Promise<APIGatewayProxyResult> {
  try {
    // Query all products with cost data
    const command = new ScanCommand({
      TableName: PRODUCTS_TABLE
    });

    const response = await docClient.send(command);
    const products = (response.Items || []) as Product[];

    // Filter products with production cost data
    const productsWithCost = products.filter(
      product => product.productionCost !== undefined && product.productionCost !== null
    );

    if (productsWithCost.length === 0) {
      return errorResponse(400, 'No products with production cost data found');
    }

    // Calculate current margins for each product
    const productData = productsWithCost.map(product => {
      const effectivePrice = product.isOnPromotion && product.promotionalPrice 
        ? product.promotionalPrice 
        : product.price;

      const contributionMargin = ((effectivePrice - product.productionCost!) / effectivePrice) * 100;

      return {
        productId: product.id,
        productName: product.name,
        currentPrice: effectivePrice,
        productionCost: product.productionCost,
        contributionMargin: contributionMargin.toFixed(2)
      };
    });

    // Prepare Bedrock prompt
    const prompt = `Eres un consultor de precios para una panadería. Revisa los siguientes datos de productos incluyendo precios actuales, costos de producción y márgenes de contribución.

Datos de Productos:
${JSON.stringify(productData, null, 2)}

Recomienda ajustes de precios para mantener márgenes saludables (objetivo: 40-60%). Para productos que ya están en el rango saludable, recomienda mantener el precio actual.

IMPORTANTE: Todas las justificaciones deben estar en español.

Proporciona las recomendaciones en formato JSON:
{
  "recommendations": [
    {
      "product": "Nombre del Producto",
      "currentPrice": 100,
      "suggestedPrice": 110,
      "reason": "Los costos de producción aumentaron, el margen bajó a 25%"
    },
    ...
  ]
}

Solo devuelve el objeto JSON, sin texto adicional. Recuerda: todas las justificaciones (reason) deben estar en español.`;

    // Invoke Bedrock with Claude 3 Sonnet
    const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
    
    const bedrockCommand = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const bedrockResponse = await bedrockClient.send(bedrockCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    
    // Extract the text content from Claude's response
    const responseText = responseBody.content[0].text;
    
    // Parse JSON from response
    let recommendationData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationData = JSON.parse(jsonMatch[0]);
      } else {
        recommendationData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Bedrock response:', parseError);
      console.error('Response text:', responseText);
      return errorResponse(500, 'Failed to parse AI recommendation response');
    }

    return successResponse(200, recommendationData);
  } catch (error: any) {
    console.error('Error getting price recommendations:', error);
    
    // Handle Bedrock-specific errors
    if (error.name === 'ThrottlingException') {
      return errorResponse(503, 'AI service temporarily unavailable due to high demand. Please try again later.');
    }
    
    if (error.name === 'TimeoutError' || error.$metadata?.httpStatusCode === 504) {
      return errorResponse(504, 'Request took too long. Please try again.');
    }

    return errorResponse(503, 'AI service temporarily unavailable. Please try again later.');
  }
}
