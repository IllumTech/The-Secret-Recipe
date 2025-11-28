# The Secret Recipe - Backend

Backend serverless para The Secret Recipe usando AWS SAM (Serverless Application Model).

## Arquitectura

- **API Gateway**: REST API para todos los endpoints
- **Lambda Functions**: 
  - Products Function: CRUD de productos
  - Orders Function: Gestión de pedidos
  - AI Generator Function: Generación de contenido con IA
- **DynamoDB**: Base de datos NoSQL para productos y pedidos
- **S3**: Almacenamiento de imágenes de productos
- **Bedrock**: Servicios de IA generativa (Claude 3 Sonnet, Stable Diffusion XL)

## Prerequisitos

1. **AWS CLI**: [Instalar AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **SAM CLI**: [Instalar SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. **Node.js 20+**: [Instalar Node.js](https://nodejs.org/)
4. **Cuenta AWS**: Con credenciales configuradas

## Configuración

### 1. Configurar AWS Credentials

```bash
aws configure
```

Ingresa:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (us-east-1)
- Default output format (json)

### 2. Instalar Dependencias

```bash
# Products function
cd functions/products
npm install
cd ../..

# Orders function
cd functions/orders
npm install
cd ../..

# AI Generator function
cd functions/ai-generator
npm install
cd ../..
```

## Deployment

### Build

```bash
sam build
```

### Deploy (Primera vez)

```bash
sam deploy --guided
```

Responde las preguntas:
- Stack Name: `the-secret-recipe`
- AWS Region: `us-east-1`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Disable rollback: `N`
- Save arguments to configuration file: `Y`

### Deploy (Subsecuentes)

```bash
sam deploy
```

### Obtener API URL

Después del deploy, SAM mostrará los outputs incluyendo la API URL:

```
Outputs
-------
Key: ApiUrl
Value: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Copia esta URL y agrégala a `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Endpoints

### Products

- `GET /products` - Listar todos los productos
- `GET /products/{id}` - Obtener un producto
- `POST /products` - Crear producto
- `PUT /products/{id}` - Actualizar producto
- `DELETE /products/{id}` - Eliminar producto (soft delete)

### Orders

- `GET /orders` - Listar todos los pedidos
- `POST /orders` - Crear pedido

### AI Generator

- `POST /ai/generate` - Generar descripción e imagen con IA

## Testing Local

### Invocar función localmente

```bash
sam local invoke ProductsFunction --event events/get-products.json
```

### Iniciar API local

```bash
sam local start-api
```

La API estará disponible en `http://localhost:3000`

## Logs

Ver logs de una función:

```bash
sam logs -n ProductsFunction --stack-name the-secret-recipe --tail
```

## Cleanup

Para eliminar todos los recursos:

```bash
sam delete
```

## Estructura de Directorios

```
backend/
├── functions/
│   ├── products/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── orders/
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ai-generator/
│       ├── index.ts
│       ├── package.json
│       └── tsconfig.json
├── template.yaml
├── samconfig.toml
└── README.md
```

## Troubleshooting

### Error: "Unable to import module"

Asegúrate de haber ejecutado `npm install` en cada directorio de función.

### Error: "Access Denied" en Bedrock

Habilita el acceso a los modelos en la consola de AWS Bedrock:
1. Ve a AWS Bedrock Console
2. Model access
3. Request access para Claude 3 Sonnet y Stable Diffusion XL

### Error: "Table does not exist"

Verifica que el stack se haya desplegado correctamente:

```bash
aws cloudformation describe-stacks --stack-name the-secret-recipe
```

## Costos Estimados

- **DynamoDB**: Pay-per-request (~$0.25 por millón de requests)
- **Lambda**: Free tier 1M requests/mes, luego $0.20 por millón
- **API Gateway**: $3.50 por millón de requests
- **S3**: $0.023 por GB/mes
- **Bedrock**: 
  - Claude 3 Sonnet: ~$0.003 por 1K tokens
  - Stable Diffusion XL: ~$0.04 por imagen

Costo estimado mensual para desarrollo: **$5-10/mes**
