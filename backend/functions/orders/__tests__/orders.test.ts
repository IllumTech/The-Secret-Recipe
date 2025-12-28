// Set environment variables before importing the handler
process.env.ORDERS_TABLE = 'test-orders-table';
process.env.PRODUCTS_TABLE = 'test-products-table';

import { handler } from '../index';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Orders Lambda Function', () => {
  beforeAll(() => {
    // Ensure environment variables are set
    process.env.ORDERS_TABLE = 'test-orders-table';
    process.env.PRODUCTS_TABLE = 'test-products-table';
  });

  beforeEach(() => {
    ddbMock.reset();
  });

  describe('Stock Reduction', () => {
    it('should reduce stock quantity when order is created', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });
      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({});

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(201);
      
      // Verify UpdateCommand was called to reduce stock
      const updateCalls = ddbMock.commandCalls(UpdateCommand);
      expect(updateCalls.length).toBe(1);
      expect(updateCalls[0].args[0].input).toMatchObject({
        Key: { id: 'prod-1' },
        UpdateExpression: 'SET stockQuantity = stockQuantity - :quantity',
        ExpressionAttributeValues: {
          ':quantity': 2,
          ':zero': 0
        }
      });
    });

    it('should reject order when stock is insufficient', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 1,
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          items: [
            {
              id: 'prod-1',
              quantity: 5
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('Insufficient stock');
    });
  });

  describe('Lead Time Validation', () => {
    it('should reject order when lead time is insufficient', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        leadTimeHours: 48,
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });

      // Delivery date is only 24 hours from now (less than 48 hour requirement)
      const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          deliveryDate: deliveryDate,
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('requires at least 48 hours notice');
    });

    it('should accept order when lead time is sufficient', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        leadTimeHours: 48,
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });
      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({});

      // Delivery date is 72 hours from now (more than 48 hour requirement)
      const deliveryDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          deliveryDate: deliveryDate,
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(201);
    });

    it('should use default 24 hours when leadTimeHours is not defined', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        // No leadTimeHours defined
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });

      // Delivery date is only 12 hours from now (less than default 24 hours)
      const deliveryDate = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          deliveryDate: deliveryDate,
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('requires at least 24 hours notice');
    });
  });

  describe('Delivery Date Fields', () => {
    it('should store deliveryDate, deliveryTime, and productionNotes', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'helado',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ddbMock.on(GetCommand).resolves({ Item: mockProduct });
      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({});

      const deliveryDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          deliveryDate: deliveryDate,
          deliveryTime: '14:00-16:00',
          productionNotes: 'Please add extra chocolate',
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.deliveryDate).toBe(deliveryDate);
      expect(body.deliveryTime).toBe('14:00-16:00');
      expect(body.productionNotes).toBe('Please add extra chocolate');
    });

    it('should reject order when deliveryDate is in the past', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/orders',
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          deliveryAddress: {
            street: '123 Main St',
            city: 'Test City'
          },
          deliveryDate: pastDate,
          items: [
            {
              id: 'prod-1',
              quantity: 2
            }
          ]
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toContain('Delivery date must be in the future');
    });
  });
});
