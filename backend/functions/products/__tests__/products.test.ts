import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock AWS SDK - must be before imports
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({}))
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: (...args: any[]) => mockSend(...args)
      }))
    },
    ScanCommand: jest.fn(),
    GetCommand: jest.fn(),
    PutCommand: jest.fn(),
    UpdateCommand: jest.fn()
  };
});

// Import after mocks
import { handler } from '../index';

describe('Products Lambda - Business Management Fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRODUCTS_TABLE = 'test-products-table';
  });

  const createMockEvent = (method: string, path: string, body?: any, pathParameters?: any): APIGatewayProxyEvent => ({
    httpMethod: method,
    path,
    body: body ? JSON.stringify(body) : null,
    pathParameters,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: ''
  });

  describe('createProduct - productionCost validation', () => {
    it('should accept positive production cost', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        productionCost: 50.5
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.productionCost).toBe(50.5);
    });

    it('should reject negative production cost', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        productionCost: -10
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Production cost must be a positive number');
    });

    it('should reject zero production cost', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        productionCost: 0
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Production cost must be a positive number');
    });
  });

  describe('createProduct - stockQuantity validation', () => {
    it('should accept non-negative stock quantity', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        stockQuantity: 10
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.stockQuantity).toBe(10);
    });

    it('should accept zero stock quantity', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        stockQuantity: 0
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.stockQuantity).toBe(0);
    });

    it('should reject negative stock quantity', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        stockQuantity: -5
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Stock quantity must be a non-negative integer');
    });

    it('should reject non-integer stock quantity', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        stockQuantity: 10.5
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Stock quantity must be a non-negative integer');
    });
  });

  describe('createProduct - minStockAlert validation', () => {
    it('should accept positive minimum stock alert', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        minStockAlert: 5
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.minStockAlert).toBe(5);
    });

    it('should reject zero minimum stock alert', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        minStockAlert: 0
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Minimum stock alert must be a positive integer');
    });

    it('should reject negative minimum stock alert', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        minStockAlert: -3
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Minimum stock alert must be a positive integer');
    });
  });

  describe('createProduct - leadTimeHours validation', () => {
    it('should accept positive lead time', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        leadTimeHours: 48
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.leadTimeHours).toBe(48);
    });

    it('should reject zero lead time', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        leadTimeHours: 0
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Lead time must be a positive integer');
    });

    it('should reject negative lead time', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        leadTimeHours: -24
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Lead time must be a positive integer');
    });
  });

  describe('createProduct - backward compatibility', () => {
    it('should create product without new fields', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100
      });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(201);
      const product = JSON.parse(result.body);
      expect(product.name).toBe('Test Product');
      expect(product.productionCost).toBeUndefined();
      expect(product.stockQuantity).toBeUndefined();
      expect(product.minStockAlert).toBeUndefined();
      expect(product.leadTimeHours).toBeUndefined();
    });
  });

  describe('updateProduct - business management fields', () => {
    it('should update production cost', async () => {
      mockSend
        .mockResolvedValueOnce({ Item: { id: '123', name: 'Test', price: 100, isActive: true } })
        .mockResolvedValueOnce({ Attributes: { id: '123', productionCost: 60 } });

      const event = createMockEvent('PUT', '/products/123', {
        productionCost: 60
      }, { id: '123' });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(200);
    });

    it('should reject invalid production cost on update', async () => {
      mockSend.mockResolvedValueOnce({ Item: { id: '123', name: 'Test', price: 100, isActive: true } });

      const event = createMockEvent('PUT', '/products/123', {
        productionCost: -10
      }, { id: '123' });

      const result = await handler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Production cost must be a positive number');
    });
  });
});
