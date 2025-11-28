# 🍦 The Secret Recipe

Una plataforma e-commerce moderna para venta de helados y postres, potenciada por Inteligencia Artificial generativa.

![AWS](https://img.shields.io/badge/AWS-Serverless-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Bedrock](https://img.shields.io/badge/AWS-Bedrock-purple)

## 🌟 Características

- **🛒 E-commerce Completo**: Catálogo de productos, carrito de compras y checkout
- **🤖 IA Generativa**: Generación automática de descripciones e imágenes con AWS Bedrock
- **⚡ Serverless**: Arquitectura 100% serverless con AWS Lambda, DynamoDB y S3
- **🎨 UI Moderna**: Interfaz elegante con Next.js 15, React 19 y Tailwind CSS
- **📱 Responsive**: Diseño adaptable para móvil, tablet y escritorio
- **🔐 Admin Panel**: Panel de administración completo para gestión de productos y pedidos

## 🏗️ Arquitectura

```
Frontend (Next.js 15)
    ↓
API Gateway
    ↓
Lambda Functions
    ├── Products (CRUD)
    ├── Orders (Gestión)
    └── AI Generator (Bedrock)
    ↓
├── DynamoDB (Base de datos)
├── S3 (Imágenes)
└── Bedrock (IA Generativa)
```

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+
- AWS CLI configurado
- SAM CLI instalado
- Cuenta de AWS

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd The-Secret-Recipe
```

2. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
```

3. **Instalar dependencias del backend**
```bash
cd ../backend
# Windows
install-dependencies.bat
# Mac/Linux
cd functions/products && npm install && cd ../..
cd functions/orders && npm install && cd ../..
cd functions/ai-generator && npm install && cd ../..
```

4. **Deploy del backend**
```bash
sam build
sam deploy --guided
```

5. **Configurar frontend**
```bash
cd ../frontend
cp .env.local.example .env.local
# Edita .env.local con tu API URL
```

6. **Iniciar desarrollo**
```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

📖 **Guía completa**: Ver [Quick Start Guide](./docs/quick-start-guide.md)

## 📁 Estructura del Proyecto

```
The-Secret-Recipe/
├── frontend/                 # Next.js 15 App
│   ├── app/                 # App Router
│   │   ├── admin/          # Panel de administración
│   │   ├── carrito/        # Página del carrito
│   │   ├── checkout/       # Proceso de checkout
│   │   └── productos/      # Catálogo de productos
│   ├── components/          # Componentes React
│   │   ├── cart/           # Componentes del carrito
│   │   ├── checkout/       # Componentes de checkout
│   │   ├── layout/         # Header, Footer
│   │   ├── products/       # Componentes de productos
│   │   └── ui/             # Componentes UI reutilizables
│   ├── contexts/            # React Context (Cart, Products)
│   ├── hooks/               # Custom hooks
│   └── lib/                 # Utilidades y API client
│
├── backend/                 # AWS SAM Backend
│   ├── functions/
│   │   ├── products/       # Lambda de productos
│   │   ├── orders/         # Lambda de pedidos
│   │   └── ai-generator/   # Lambda de IA generativa
│   └── template.yaml       # SAM template
│
├── docs/                    # Documentación
│   ├── quick-start-guide.md
│   ├── backend-deployment-guide.md
│   ├── project-plan.md
│   └── architecture_diagram.png
│
└── scripts/                 # Scripts de utilidad
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS
- **State**: React Context, SWR
- **Icons**: Lucide React
- **Language**: TypeScript

### Backend
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Compute**: AWS Lambda (Node.js 20)
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **API**: Amazon API Gateway
- **AI**: Amazon Bedrock (Claude 3 Sonnet, Stable Diffusion XL)

## 🎯 Funcionalidades

### Sitio Público
- ✅ Catálogo de productos con filtros por categoría
- ✅ Vista detallada de productos
- ✅ Carrito de compras con modal deslizante
- ✅ Proceso de checkout con validación
- ✅ Confirmación de pedido
- ✅ Diseño responsive y animaciones suaves

### Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ CRUD completo de productos
- ✅ Generación de contenido con IA
- ✅ Gestión de pedidos
- ✅ Filtros y búsqueda

### IA Generativa
- ✅ Generación automática de descripciones de productos
- ✅ Generación de imágenes de productos
- ✅ Integración con AWS Bedrock
- ✅ Modelos: Claude 3 Sonnet y Stable Diffusion XL

## 📊 API Endpoints

### Products
- `GET /products` - Listar productos
- `GET /products/{id}` - Obtener producto
- `POST /products` - Crear producto
- `PUT /products/{id}` - Actualizar producto
- `DELETE /products/{id}` - Eliminar producto

### Orders
- `GET /orders` - Listar pedidos
- `POST /orders` - Crear pedido

### AI Generator
- `POST /ai/generate` - Generar contenido con IA

## 💰 Costos Estimados

| Servicio | Costo Mensual (Desarrollo) |
|----------|---------------------------|
| Lambda | ~$0 (Free tier) |
| API Gateway | ~$0 (Free tier) |
| DynamoDB | ~$0 (Free tier) |
| S3 | ~$0.50 |
| Bedrock (Claude) | ~$3 (1000 generaciones) |
| Bedrock (SD XL) | ~$40 (1000 imágenes) |
| **Total** | **$5-10/mes** |

## 🚀 Deployment

### Backend (AWS)
```bash
cd backend
sam build
sam deploy
```

### Frontend (Amplify)
1. Conecta tu repositorio en AWS Amplify
2. Configura la variable `NEXT_PUBLIC_API_URL`
3. Deploy automático en cada push

Ver [Backend Deployment Guide](./docs/backend-deployment-guide.md) para más detalles.

## 📚 Documentación

- [Quick Start Guide](./docs/quick-start-guide.md) - Guía de inicio rápido
- [Backend Deployment](./docs/backend-deployment-guide.md) - Deploy del backend
- [Project Plan](./docs/project-plan.md) - Plan completo del proyecto
- [Architecture](./docs/project-proposal.md) - Propuesta y arquitectura

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint

# Backend (local)
cd backend
sam local start-api
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat(scope): descripción'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

Ver [Git Conventions](./docs/git-rules.md) para convenciones de commits.

## 📝 Licencia

Este proyecto es parte de un proyecto académico/demostrativo.

## 👥 Autores

- Tu Nombre - Desarrollo completo

## 🙏 Agradecimientos

- AWS por los servicios serverless
- Next.js team por el excelente framework
- Anthropic y Stability AI por los modelos de IA

---

**Hecho con ❤️ y ☕ usando AWS y Next.js**
