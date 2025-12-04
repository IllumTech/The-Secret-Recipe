import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: 'us-east-1' });
const IMAGES_BUCKET = process.env.IMAGES_BUCKET!;

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
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

  try {
    // Handle OPTIONS for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return successResponse(200, {});
    }

    if (event.httpMethod !== 'POST') {
      return errorResponse(405, 'Method not allowed');
    }

    const body = JSON.parse(event.body || '{}');
    const { image, fileName, contentType } = body;

    if (!image) {
      return errorResponse(400, 'Missing required field: image (base64)');
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');

    // Generate unique filename
    const extension = fileName ? fileName.split('.').pop() : 'jpg';
    const imageKey = `products/${uuidv4()}.${extension}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: contentType || 'image/jpeg',
      CacheControl: 'max-age=31536000'
    });

    await s3Client.send(uploadCommand);

    // Return public URL
    const imageUrl = `https://${IMAGES_BUCKET}.s3.amazonaws.com/${imageKey}`;
    console.log('Uploaded image URL:', imageUrl);

    return successResponse(200, { imageUrl });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Failed to upload image');
  }
};
