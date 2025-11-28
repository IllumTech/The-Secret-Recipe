/**
 * Script para poblar la base de datos con productos iniciales
 * 
 * Uso:
 * 1. Asegúrate de tener la API URL configurada
 * 2. Ejecuta: npx ts-node scripts/seed-products.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

interface Product {
  name: string;
  category: 'helado' | 'postre';
  price: number;
  description: string;
  image: string;
}

const products: Product[] = [
  {
    name: 'Helado de Vainilla Clásico',
    category: 'helado',
    price: 4.99,
    description: 'Cremoso helado de vainilla natural con un toque de extracto de Madagascar. Perfecto para cualquier ocasión.',
    image: '🍦'
  },
  {
    name: 'Helado de Chocolate Belga',
    category: 'helado',
    price: 5.49,
    description: 'Intenso helado de chocolate elaborado con cacao belga premium. Una experiencia chocolatosa inolvidable.',
    image: '🍫'
  },
  {
    name: 'Helado de Fresa Natural',
    category: 'helado',
    price: 5.29,
    description: 'Refrescante helado de fresas frescas con trozos de fruta real. Dulce y delicioso.',
    image: '🍓'
  },
  {
    name: 'Helado de Menta con Chips',
    category: 'helado',
    price: 5.49,
    description: 'Refrescante helado de menta con chips de chocolate oscuro. Una combinación perfecta.',
    image: '🌿'
  },
  {
    name: 'Helado de Cookies & Cream',
    category: 'helado',
    price: 5.99,
    description: 'Cremoso helado de vainilla con generosos trozos de galletas Oreo. Un clásico irresistible.',
    image: '🍪'
  },
  {
    name: 'Tarta de Queso New York',
    category: 'postre',
    price: 6.99,
    description: 'Clásica tarta de queso estilo Nueva York con base de galleta y cobertura de frutos rojos.',
    image: '🍰'
  },
  {
    name: 'Brownie de Chocolate',
    category: 'postre',
    price: 4.49,
    description: 'Brownie húmedo y denso de chocolate con nueces. Servido tibio con helado de vainilla.',
    image: '🧁'
  },
  {
    name: 'Tiramisú Italiano',
    category: 'postre',
    price: 7.49,
    description: 'Auténtico tiramisú italiano con capas de bizcocho empapado en café y crema de mascarpone.',
    image: '☕'
  },
  {
    name: 'Tarta de Manzana Casera',
    category: 'postre',
    price: 5.99,
    description: 'Tarta de manzana tradicional con canela y masa crujiente. Perfecta con helado de vainilla.',
    image: '🥧'
  },
  {
    name: 'Mousse de Chocolate',
    category: 'postre',
    price: 5.49,
    description: 'Suave y aireado mousse de chocolate oscuro con crema batida. Una delicia ligera y elegante.',
    image: '🍮'
  }
];

async function createProduct(product: Product): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string };
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const created = await response.json() as { name: string; id: string };
    console.log(`✅ Creado: ${created.name} (${created.id})`);
  } catch (error) {
    console.error(`❌ Error creando ${product.name}:`, error);
    throw error;
  }
}

async function seedProducts(): Promise<void> {
  console.log('🌱 Iniciando seed de productos...\n');
  console.log(`📡 API URL: ${API_URL}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      await createProduct(product);
      successCount++;
      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      errorCount++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`✅ Productos creados: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📦 Total: ${products.length}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Algunos productos no se pudieron crear. Verifica los logs arriba.');
    process.exit(1);
  } else {
    console.log('\n🎉 ¡Seed completado exitosamente!');
    process.exit(0);
  }
}

// Ejecutar seed
seedProducts().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
