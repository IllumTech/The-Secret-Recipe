import { APIGatewayProxyEvent } from 'aws-lambda';
import * as fc from 'fast-check';

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

describe('Products Lambda - Property-Based Tests', () => {
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

  // Feature: business-management-module, Property 1: Production cost validation
  // Validates: Requirements 1.1
  describe('Property 1: Production cost validation', () => {
    it('should accept only positive decimal numbers for productionCost', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
          async (productionCost) => {
            mockSend.mockResolvedValueOnce({});

            const event = createMockEvent('POST', '/products', {
              name: 'Test Product',
              category: 'helado',
              price: 100,
              productionCost
            });

            const result = await handler(event);
            
            // Should accept positive decimal numbers
            expect(result.statusCode).toBe(201);
            const product = JSON.parse(result.body);
            expect(product.productionCost).toBeCloseTo(productionCost, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative productionCost values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: -10000, max: -0.01, noNaN: true, noDefaultInfinity: true }),
          async (productionCost) => {
            const event = createMockEvent('POST', '/products', {
              name: 'Test Product',
              category: 'helado',
              price: 100,
              productionCost
            });

            const result = await handler(event);
            
            // Should reject negative values
            expect(result.statusCode).toBe(400);
            expect(result.body).toContain('Production cost must be a positive number');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject zero productionCost', async () => {
      const event = createMockEvent('POST', '/products', {
        name: 'Test Product',
        category: 'helado',
        price: 100,
        productionCost: 0
      });

      const result = await handler(event);
      
      // Should reject zero
      expect(result.statusCode).toBe(400);
      expect(result.body).toContain('Production cost must be a positive number');
    });

    it('should reject non-numeric productionCost values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant('not a number'),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity),
            fc.constant({}),
            fc.constant([]),
            fc.constant(true),
            fc.constant(false)
          ),
          async (productionCost) => {
            const event = createMockEvent('POST', '/products', {
              name: 'Test Product',
              category: 'helado',
              price: 100,
              productionCost
            });

            const result = await handler(event);
            
            // Should reject non-numeric values
            // Note: undefined is acceptable (field is optional), so we skip that case
            if (productionCost === undefined) {
              expect(result.statusCode).toBe(201);
            } else {
              expect(result.statusCode).toBe(400);
              expect(result.body).toContain('Production cost must be a positive number');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate productionCost on product updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
          async (productionCost) => {
            // Mock existing product
            mockSend
              .mockResolvedValueOnce({ Item: { id: '123', name: 'Test', price: 100, isActive: true } })
              .mockResolvedValueOnce({ Attributes: { id: '123', productionCost } });

            const event = createMockEvent('PUT', '/products/123', {
              productionCost
            }, { id: '123' });

            const result = await handler(event);
            
            // Should accept positive values on update
            expect(result.statusCode).toBe(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid productionCost on product updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: -10000, max: 0, noNaN: true, noDefaultInfinity: true }),
          async (productionCost) => {
            // Mock existing product
            mockSend.mockResolvedValueOnce({ Item: { id: '123', name: 'Test', price: 100, isActive: true } });

            const event = createMockEvent('PUT', '/products/123', {
              productionCost
            }, { id: '123' });

            const result = await handler(event);
            
            // Should reject non-positive values on update
            expect(result.statusCode).toBe(400);
            expect(result.body).toContain('Production cost must be a positive number');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
