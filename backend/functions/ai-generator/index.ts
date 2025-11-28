import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });
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
    const { productName, category } = body;

    if (!productName || !category) {
      return errorResponse(400, 'Missing required fields: productName, category');
    }

    console.log(`Generating content for: ${productName} (${category})`);

    // Generate description and image in parallel
    const [description, imageUrl] = await Promise.all([
      generateDescription(productName, category),
      generateImage(productName, category)
    ]);

    return successResponse(200, {
      description,
      imageUrl
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Failed to generate content');
  }
};

// Generate product description using Claude
async function generateDescription(productName: string, category: string): Promise<string> {
  try {
    const prompt = `Eres un experto en marketing de productos gourmet. Escribe una descripción atractiva y apetitosa para un producto llamado "${productName}" que es un ${category}.

La descripción debe:
- Ser breve (2-3 oraciones, máximo 150 palabras)
- Destacar sabores y texturas
- Ser apetitosa y persuasiva
- Estar en español
- No incluir precio ni disponibilidad

Escribe solo la descripción, sin introducción ni conclusión.`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    const description = responseBody.content[0].text.trim();
    console.log('Generated description:', description);
    
    return description;
  } catch (error) {
    console.error('Error generating description:', error);
    throw new Error('Failed to generate description');
  }
}

// Generate product image using Stable Diffusion
async function generateImage(productName: string, category: string): Promise<string> {
  try {
    const prompt = `A professional, appetizing photo of ${productName}, a delicious ${category}. High quality food photography, well-lit, clean background, studio lighting, commercial product shot, 4k, detailed texture`;

    const payload = {
      text_prompts: [
        {
          text: prompt,
          weight: 1
        },
        {
          text: "blurry, low quality, distorted, ugly, bad composition",
          weight: -1
        }
      ],
      cfg_scale: 10,
      steps: 50,
      seed: Math.floor(Math.random() * 1000000),
      width: 512,
      height: 512
    };

    const command = new InvokeModelCommand({
      modelId: 'stability.stable-diffusion-xl-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Get base64 image
    const base64Image = responseBody.artifacts[0].base64;
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Upload to S3
    const imageKey = `products/${uuidv4()}.png`;
    const uploadCommand = new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: 'image/png',
      CacheControl: 'max-age=31536000'
    });

    await s3Client.send(uploadCommand);

    // Return public URL
    const imageUrl = `https://${IMAGES_BUCKET}.s3.amazonaws.com/${imageKey}`;
    console.log('Generated image URL:', imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a placeholder emoji if image generation fails
    return '🍦';
  }
}
