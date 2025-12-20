// Feature: business-management-module, Property 2: Production cost persistence round-trip
// Validates: Requirements 1.2

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

// Helper to create API Gateway event
const createMockEvent = (
  httpMethod: string,
  path: string,
  body?: any,
  pathParameters?: any
): APIGatewayProxyEvent => ({
  httpMethod,
  path,
  body: body ? JSON.stringify(body) : null,
  pathParameters,
  headers: {},
  multiValueHeaders: {},
  isBase64Encoded: false,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  requestContext: {} as any,
  resource: '',
  stageVariables: null
});

describe('Property 2: Production cost persistence round-trip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRODUCTS_TABLE = 'test-products-table';
  });

  it('should persist and retrieve exact production cost for any valid positive decimal', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 ]{0,48}[a-zA-Z0-9]$/),
          category: fc.constantFrom('helado', 'postre'),
          price: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
          productionCost: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
          description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
        }),
        async (productData) => {
          let savedProduct: any = null;

          // Mock DynamoDB PutCommand to capture the saved product
          mockSend.mockImplementationOnce(() => {
            return Promise.resolve({});
          });

          // Create product via Lambda handler
          const createEvent = createMockEvent('POST', '/products', productData);
          const createResponse = await handler(createEvent);

          expect(createResponse.statusCode).toBe(201);
          const createdProduct = JSON.parse(createResponse.body);
          savedProduct = createdProduct;

          // Mock DynamoDB GetCommand to return the saved product
          mockSend.mockResolvedValueOnce({ Item: savedProduct });

          // Retrieve product via Lambda handler
          const getEvent = createMockEvent('GET', `/products/${createdProduct.id}`, undefined, {
            id: createdProduct.id
          });
          const getResponse = await handler(getEvent);

          expect(getResponse.statusCode).toBe(200);
          const retrievedProduct = JSON.parse(getResponse.body);

          // Verify production cost round-trip: saved value should match retrieved value exactly
          expect(retrievedProduct.productionCost).toBe(createdProduct.productionCost);
          expect(retrievedProduct.productionCost).toBe(productData.productionCost);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should persist and retrieve exact production cost on product updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 ]{0,48}[a-zA-Z0-9]$/),
          category: fc.constantFrom('helado', 'postre'),
          price: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
          initialCost: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
          updatedCost: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true })
        }),
        async (data) => {
          let savedProduct: any = null;

          // Mock DynamoDB PutCommand for create
          mockSend.mockResolvedValueOnce({});

          // Create product with initial cost
          const createEvent = createMockEvent('POST', '/products', {
            name: data.name,
            category: data.category,
            price: data.price,
            productionCost: data.initialCost
          });
          const createResponse = await handler(createEvent);
          expect(createResponse.statusCode).toBe(201);
          const createdProduct = JSON.parse(createResponse.body);
          savedProduct = createdProduct;

          // Mock GetCommand for update validation
          mockSend.mockResolvedValueOnce({ Item: savedProduct });

          // Mock UpdateCommand for update
          const updatedProduct = { ...savedProduct, productionCost: data.updatedCost, updatedAt: new Date().toISOString() };
          mockSend.mockResolvedValueOnce({ Attributes: updatedProduct });

          // Update product with new cost
          const updateEvent = createMockEvent(
            'PUT',
            `/products/${createdProduct.id}`,
            { productionCost: data.updatedCost },
            { id: createdProduct.id }
          );

          const updateResponse = await handler(updateEvent);
          expect(updateResponse.statusCode).toBe(200);
          const updatedProductResponse = JSON.parse(updateResponse.body);

          // Mock GetCommand for retrieval
          mockSend.mockResolvedValueOnce({ Item: updatedProduct });

          // Retrieve updated product
          const getEvent = createMockEvent('GET', `/products/${createdProduct.id}`, undefined, {
            id: createdProduct.id
          });
          const getResponse = await handler(getEvent);
          expect(getResponse.statusCode).toBe(200);
          const retrievedProduct = JSON.parse(getResponse.body);

          // Verify updated production cost persists correctly
          expect(retrievedProduct.productionCost).toBe(updatedProductResponse.productionCost);
          expect(retrievedProduct.productionCost).toBe(data.updatedCost);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle products without production cost (optional field)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 ]{0,48}[a-zA-Z0-9]$/),
          category: fc.constantFrom('helado', 'postre'),
          price: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true })
        }),
        async (productData) => {
          let savedProduct: any = null;

          // Mock DynamoDB PutCommand
          mockSend.mockResolvedValueOnce({});

          // Create product without production cost
          const createEvent = createMockEvent('POST', '/products', productData);
          const createResponse = await handler(createEvent);

          expect(createResponse.statusCode).toBe(201);
          const createdProduct = JSON.parse(createResponse.body);
          savedProduct = createdProduct;

          // Mock DynamoDB GetCommand
          mockSend.mockResolvedValueOnce({ Item: savedProduct });

          // Retrieve product
          const getEvent = createMockEvent('GET', `/products/${createdProduct.id}`, undefined, {
            id: createdProduct.id
          });
          const getResponse = await handler(getEvent);

          expect(getResponse.statusCode).toBe(200);
          const retrievedProduct = JSON.parse(getResponse.body);

          // Verify productionCost is undefined (not present)
          expect(retrievedProduct.productionCost).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve precision for decimal production costs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9 ]{0,48}[a-zA-Z0-9]$/),
          category: fc.constantFrom('helado', 'postre'),
          price: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
          // Generate costs with specific decimal precision
          productionCost: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true, noDefaultInfinity: true })
        }),
        async (productData) => {
          let savedProduct: any = null;

          // Mock DynamoDB PutCommand
          mockSend.mockResolvedValueOnce({});

          // Create product
          const createEvent = createMockEvent('POST', '/products', productData);
          const createResponse = await handler(createEvent);
          expect(createResponse.statusCode).toBe(201);
          const createdProduct = JSON.parse(createResponse.body);
          savedProduct = createdProduct;

          // Mock DynamoDB GetCommand
          mockSend.mockResolvedValueOnce({ Item: savedProduct });

          // Retrieve product
          const getEvent = createMockEvent('GET', `/products/${createdProduct.id}`, undefined, {
            id: createdProduct.id
          });
          const getResponse = await handler(getEvent);
          expect(getResponse.statusCode).toBe(200);
          const retrievedProduct = JSON.parse(getResponse.body);

          // Verify exact value match (no precision loss)
          expect(retrievedProduct.productionCost).toBe(createdProduct.productionCost);
          
          // Verify the value is a valid number
          expect(typeof retrievedProduct.productionCost).toBe('number');
          expect(retrievedProduct.productionCost).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
