# Scripts de Utilidad

Scripts para facilitar tareas comunes en La Receta Secreta.

## Seed de Productos

Pobla la base de datos con 10 productos de ejemplo.

### Uso

1. **Instalar dependencias**
```bash
cd scripts
npm install
```

2. **Configurar API URL**
```bash
# Windows
set API_URL=https://tu-api-url.execute-api.us-east-1.amazonaws.com/prod

# Mac/Linux
export API_URL=https://tu-api-url.execute-api.us-east-1.amazonaws.com/prod
```

3. **Ejecutar seed**
```bash
npm run seed
```

### Productos que se crean

El script crea 10 productos:

**Helados (5):**
- Helado de Vainilla Clásico - $4.99
- Helado de Chocolate Belga - $5.49
- Helado de Fresa Natural - $5.29
- Helado de Menta con Chips - $5.49
- Helado de Cookies & Cream - $5.99

**Postres (5):**
- Tarta de Queso New York - $6.99
- Brownie de Chocolate - $4.49
- Tiramisú Italiano - $7.49
- Tarta de Manzana Casera - $5.99
- Mousse de Chocolate - $5.49

### Troubleshooting

**Error: "Failed to fetch"**
- Verifica que la API URL sea correcta
- Verifica que el backend esté desplegado
- Verifica que no haya problemas de CORS

**Error: "Missing required fields"**
- Verifica que el backend esté funcionando correctamente
- Revisa los logs de Lambda

## Otros Scripts

### Limpiar Productos

Para eliminar todos los productos (próximamente):
```bash
npm run clean
```

### Backup de Datos

Para hacer backup de DynamoDB (próximamente):
```bash
npm run backup
```
