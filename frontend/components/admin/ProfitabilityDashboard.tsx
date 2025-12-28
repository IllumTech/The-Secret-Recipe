'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface ProductWithMetrics extends Product {
  contributionMargin: number;
  effectivePrice: number;
}

export default function ProfitabilityDashboard() {
  const [products, setProducts] = useState<ProductWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const allProducts = await getProducts();
      
      // Filter products with production cost and calculate metrics
      const productsWithMetrics = allProducts
        .filter(p => p.productionCost !== undefined && p.productionCost !== null)
        .map(p => {
          const effectivePrice = p.isOnPromotion && p.promotionalPrice 
            ? p.promotionalPrice 
            : p.price;
          const contributionMargin = ((effectivePrice - p.productionCost!) / effectivePrice) * 100;
          
          return {
            ...p,
            effectivePrice,
            contributionMargin
          };
        })
        // Sort by contribution margin descending
        .sort((a, b) => b.contributionMargin - a.contributionMargin);
      
      setProducts(productsWithMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const getRowClassName = (index: number, totalCount: number) => {
    // Top 3 products - green indicator
    if (index < 3) {
      return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    }
    // Bottom 3 products - red indicator
    if (index >= totalCount - 3) {
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    }
    return 'bg-white dark:bg-gray-800';
  };

  const getMarginColor = (margin: number) => {
    if (margin < 0) return 'text-red-600 dark:text-red-400 font-bold';
    if (margin < 20) return 'text-orange-600 dark:text-orange-400';
    if (margin < 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
        <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No hay datos de rentabilidad
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Agrega costos de producción a tus productos para ver el análisis de rentabilidad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Dashboard de Rentabilidad
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Análisis de margen de contribución por producto
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Productos Analizados
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {products.length}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                Mejor Margen
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {products[0]?.contributionMargin.toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                Menor Margen
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                {products[products.length - 1]?.contributionMargin.toFixed(2)}%
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Precio Efectivo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Costo Producción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {products.map((product, index) => (
                <tr 
                  key={product.id}
                  className={`${getRowClassName(index, products.length)} transition-colors hover:bg-slate-50 dark:hover:bg-gray-700`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        #{index + 1}
                      </span>
                      {index < 3 && (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 ml-2" />
                      )}
                      {index >= products.length - 3 && (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.isOnPromotion && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            En Promoción
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {product.category === 'helado' ? 'Helado' : 'Postre'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-white">
                    ${product.effectivePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-white">
                    ${product.productionCost!.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-lg font-bold ${getMarginColor(product.contributionMargin)}`}>
                      {product.contributionMargin.toFixed(2)}%
                    </span>
                    {product.contributionMargin < 0 && (
                      <div className="flex items-center justify-end mt-1">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Rentabilidad negativa
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Leyenda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-700 dark:text-slate-300">
              Top 3 productos más rentables
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-slate-700 dark:text-slate-300">
              Bottom 3 productos menos rentables
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
