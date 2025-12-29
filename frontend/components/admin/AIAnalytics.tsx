'use client';

import { useState } from 'react';
import { getDemandForecast, getPriceRecommendations } from '@/lib/api';
import { Brain, TrendingUp, DollarSign, AlertCircle, RefreshCw, Sparkles, Search, LayoutGrid, List, ArrowUpDown, Filter, TrendingDown, Minus } from 'lucide-react';

interface ForecastItem {
  product: string;
  day: string;
  quantity: number;
}

interface RecommendationItem {
  product: string;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
}

export default function AIAnalytics() {
  // Demand Forecast State
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [forecastSearchTerm, setForecastSearchTerm] = useState('');
  const [forecastSortBy, setForecastSortBy] = useState<'name' | 'total' | 'avg'>('total');
  const [forecastViewMode, setForecastViewMode] = useState<'cards' | 'table'>('cards');

  // Price Recommendations State
  const [recommendationsData, setRecommendationsData] = useState<RecommendationItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [recommendationsSearchTerm, setRecommendationsSearchTerm] = useState('');
  const [recommendationsFilterBy, setRecommendationsFilterBy] = useState<'all' | 'increase' | 'decrease' | 'maintain'>('all');

  // Handle Demand Forecast Request
  const handleForecastRequest = async () => {
    try {
      setForecastLoading(true);
      setForecastError(null);
      const response = await getDemandForecast();
      setForecastData(response.forecast || []);
    } catch (err: any) {
      console.error('Error fetching demand forecast:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al obtener pronóstico de demanda';
      setForecastError(errorMessage);
    } finally {
      setForecastLoading(false);
    }
  };

  // Handle Price Recommendations Request
  const handleRecommendationsRequest = async () => {
    try {
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      const response = await getPriceRecommendations();
      setRecommendationsData(response.recommendations || []);
    } catch (err: any) {
      console.error('Error fetching price recommendations:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al obtener recomendaciones de precios';
      setRecommendationsError(errorMessage);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Determine if price should be maintained
  const shouldMaintainPrice = (reason: string) => {
    return reason.toLowerCase().includes('mantener') || 
           reason.toLowerCase().includes('maintain') ||
           reason.toLowerCase().includes('saludable') ||
           reason.toLowerCase().includes('healthy');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              Análisis con IA
            </h2>
            <p className="text-purple-100">
              Pronósticos de demanda y recomendaciones de precios impulsados por Amazon Bedrock
            </p>
          </div>
          <Sparkles className="w-12 h-12 opacity-80" />
        </div>
      </div>

      {/* Demand Forecast Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              Pronóstico de Demanda
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Predicción de demanda para los próximos 7 días basada en historial de pedidos
            </p>
          </div>
          <button
            onClick={handleForecastRequest}
            disabled={forecastLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
          >
            {forecastLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Solicitar Pronóstico</span>
              </>
            )}
          </button>
        </div>

        {/* Forecast Loading State */}
        {forecastLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Analizando historial de pedidos con IA...
            </p>
          </div>
        )}

        {/* Forecast Error State */}
        {forecastError && !forecastLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Error al obtener pronóstico
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {forecastError}
                </p>
                <button
                  onClick={handleForecastRequest}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Results - Grouped by Product */}
        {forecastData.length > 0 && !forecastLoading && (
          <div className="space-y-4">
            {/* Summary Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Predicción para los próximos 7 días:</strong> Estas cantidades son sugerencias de producción basadas en tu historial de ventas. Ajusta según eventos especiales o cambios en la demanda.
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50 dark:bg-gray-700 p-4 rounded-lg">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={forecastSearchTerm}
                  onChange={(e) => setForecastSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={forecastSortBy}
                  onChange={(e) => setForecastSortBy(e.target.value as 'name' | 'total' | 'avg')}
                  className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="total">Mayor demanda total</option>
                  <option value="avg">Mayor promedio diario</option>
                  <option value="name">Nombre A-Z</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-slate-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setForecastViewMode('cards')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      forecastViewMode === 'cards'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`}
                    title="Vista de tarjetas"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setForecastViewMode('table')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      forecastViewMode === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`}
                    title="Vista de tabla"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Group forecast by product */}
            {(() => {
              // Group data by product
              const groupedData: Record<string, ForecastItem[]> = {};
              forecastData.forEach(item => {
                if (!groupedData[item.product]) {
                  groupedData[item.product] = [];
                }
                groupedData[item.product].push(item);
              });

              // Sort each product's forecasts by date
              Object.keys(groupedData).forEach(product => {
                groupedData[product].sort((a, b) => 
                  new Date(a.day).getTime() - new Date(b.day).getTime()
                );
              });

              // Calculate metrics and filter
              let productsWithMetrics = Object.entries(groupedData).map(([productName, forecasts]) => {
                const totalQuantity = forecasts.reduce((sum, f) => sum + f.quantity, 0);
                const avgDaily = Math.round(totalQuantity / forecasts.length);
                return { productName, forecasts, totalQuantity, avgDaily };
              });

              // Apply search filter
              if (forecastSearchTerm) {
                productsWithMetrics = productsWithMetrics.filter(p =>
                  p.productName.toLowerCase().includes(forecastSearchTerm.toLowerCase())
                );
              }

              // Apply sorting
              productsWithMetrics.sort((a, b) => {
                if (forecastSortBy === 'total') return b.totalQuantity - a.totalQuantity;
                if (forecastSortBy === 'avg') return b.avgDaily - a.avgDaily;
                return a.productName.localeCompare(b.productName);
              });

              // Show "no results" message
              if (productsWithMetrics.length === 0) {
                return (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No se encontraron productos que coincidan con &quot;{forecastSearchTerm}&quot;
                    </p>
                  </div>
                );
              }

              // Render based on view mode
              if (forecastViewMode === 'table') {
                // Compact table view
                return (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">
                              Producto
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">
                              Total 7d
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">
                              Prom/día
                            </th>
                            {productsWithMetrics[0].forecasts.map((f, idx) => {
                              const date = new Date(f.day);
                              const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                              const dayNum = date.getDate();
                              return (
                                <th key={idx} className="px-3 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">
                                  <div>{dayName}</div>
                                  <div className="font-bold">{dayNum}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                          {productsWithMetrics.map(({ productName, forecasts, totalQuantity, avgDaily }) => (
                            <tr key={productName} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                {productName}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {totalQuantity}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                  {avgDaily}
                                </span>
                              </td>
                              {forecasts.map((forecast, idx) => {
                                const date = new Date(forecast.day);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                  <td key={idx} className={`px-3 py-4 text-center ${
                                    isWeekend ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                  }`}>
                                    <span className={`text-sm font-bold ${
                                      isWeekend 
                                        ? 'text-purple-600 dark:text-purple-400' 
                                        : 'text-slate-900 dark:text-white'
                                    }`}>
                                      {forecast.quantity}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // Card view (original)
              return (
                <div className="space-y-4">
                  {productsWithMetrics.map(({ productName, forecasts, totalQuantity, avgDaily }) => (
                    <div key={productName} className="bg-white dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600 overflow-hidden">
                      {/* Product Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-b border-slate-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {productName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="text-right">
                              <p className="text-slate-600 dark:text-slate-400">Total 7 días</p>
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {totalQuantity} unidades
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-600 dark:text-slate-400">Promedio diario</p>
                              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                {avgDaily} unidades
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Daily Forecast */}
                      <div className="p-6">
                        <div className="grid grid-cols-7 gap-3">
                          {forecasts.map((forecast, idx) => {
                            const date = new Date(forecast.day);
                            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                            const dayNum = date.getDate();
                            const month = date.toLocaleDateString('es-ES', { month: 'short' });
                            
                            // Highlight weekends
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            return (
                              <div 
                                key={idx}
                                className={`text-center p-4 rounded-lg border-2 transition-all ${
                                  isWeekend 
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' 
                                    : 'bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-600'
                                }`}
                              >
                                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                  {dayName}
                                </div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                  {dayNum}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                  {month}
                                </div>
                                <div className={`text-2xl font-bold ${
                                  isWeekend 
                                    ? 'text-purple-600 dark:text-purple-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {forecast.quantity}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  unidades
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Forecast Empty State */}
        {forecastData.length === 0 && !forecastLoading && !forecastError && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Haz clic en &quot;Solicitar Pronóstico&quot; para obtener predicciones de demanda
            </p>
          </div>
        )}
      </div>

      {/* Price Recommendations Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
              Recomendaciones de Precios
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sugerencias de ajuste de precios para mantener márgenes saludables (40-60%)
            </p>
          </div>
          <button
            onClick={handleRecommendationsRequest}
            disabled={recommendationsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium"
          >
            {recommendationsLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Solicitar Recomendaciones</span>
              </>
            )}
          </button>
        </div>

        {/* Recommendations Loading State */}
        {recommendationsLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Analizando precios y márgenes con IA...
            </p>
          </div>
        )}

        {/* Recommendations Error State */}
        {recommendationsError && !recommendationsLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Error al obtener recomendaciones
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {recommendationsError}
                </p>
                <button
                  onClick={handleRecommendationsRequest}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Results Table */}
        {recommendationsData.length > 0 && !recommendationsLoading && (
          <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-50 dark:bg-gray-700 p-4 rounded-lg">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={recommendationsSearchTerm}
                  onChange={(e) => setRecommendationsSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <select
                  value={recommendationsFilterBy}
                  onChange={(e) => setRecommendationsFilterBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Todas las recomendaciones</option>
                  <option value="increase">Solo aumentos</option>
                  <option value="decrease">Solo reducciones</option>
                  <option value="maintain">Mantener precio</option>
                </select>
              </div>
            </div>

            {/* Filter and display recommendations */}
            {(() => {
              // Filter recommendations
              let filteredRecommendations = recommendationsData.filter(item => {
                // Search filter
                if (recommendationsSearchTerm && !item.product.toLowerCase().includes(recommendationsSearchTerm.toLowerCase())) {
                  return false;
                }

                // Type filter
                const priceChange = item.suggestedPrice - item.currentPrice;
                const maintainPrice = shouldMaintainPrice(item.reason);

                if (recommendationsFilterBy === 'increase' && (priceChange <= 0 || maintainPrice)) return false;
                if (recommendationsFilterBy === 'decrease' && (priceChange >= 0 || maintainPrice)) return false;
                if (recommendationsFilterBy === 'maintain' && !maintainPrice) return false;

                return true;
              });

              // Show "no results" message
              if (filteredRecommendations.length === 0) {
                return (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {recommendationsSearchTerm 
                        ? <>No se encontraron productos que coincidan con &quot;{recommendationsSearchTerm}&quot;</>
                        : 'No hay recomendaciones que coincidan con el filtro seleccionado'
                      }
                    </p>
                  </div>
                );
              }

              // Group by recommendation type for better organization
              const increases = filteredRecommendations.filter(item => {
                const priceChange = item.suggestedPrice - item.currentPrice;
                return priceChange > 0 && !shouldMaintainPrice(item.reason);
              });
              const decreases = filteredRecommendations.filter(item => {
                const priceChange = item.suggestedPrice - item.currentPrice;
                return priceChange < 0 && !shouldMaintainPrice(item.reason);
              });
              const maintains = filteredRecommendations.filter(item => shouldMaintainPrice(item.reason));

              return (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {increases.length > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Aumentar precio</p>
                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{increases.length}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    )}
                    {decreases.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Reducir precio</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{decreases.length}</p>
                          </div>
                          <TrendingDown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    )}
                    {maintains.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Mantener precio</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{maintains.length}</p>
                          </div>
                          <Minus className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Acción
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Precio Actual
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Precio Sugerido
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Cambio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Justificación
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                          {filteredRecommendations.map((item, index) => {
                            const priceChange = item.suggestedPrice - item.currentPrice;
                            const priceChangePercent = (priceChange / item.currentPrice) * 100;
                            const maintainPrice = shouldMaintainPrice(item.reason);

                            return (
                              <tr 
                                key={index}
                                className={`hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${
                                  maintainPrice 
                                    ? 'bg-green-50/50 dark:bg-green-900/5' 
                                    : priceChange > 0 
                                      ? 'bg-orange-50/50 dark:bg-orange-900/5' 
                                      : 'bg-blue-50/50 dark:bg-blue-900/5'
                                }`}
                              >
                                <td className="px-6 py-4">
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {item.product}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {maintainPrice ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                      <Minus className="w-3 h-3 mr-1" />
                                      Mantener
                                    </span>
                                  ) : priceChange > 0 ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Aumentar
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      Reducir
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    ${item.currentPrice.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`text-sm font-bold ${
                                    maintainPrice 
                                      ? 'text-green-700 dark:text-green-400' 
                                      : priceChange > 0 
                                        ? 'text-orange-700 dark:text-orange-400' 
                                        : 'text-blue-700 dark:text-blue-400'
                                  }`}>
                                    ${item.suggestedPrice.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {!maintainPrice && priceChange !== 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className={`text-sm font-bold ${
                                        priceChange > 0 
                                          ? 'text-orange-700 dark:text-orange-400' 
                                          : 'text-blue-700 dark:text-blue-400'
                                      }`}>
                                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}
                                      </span>
                                      <span className={`text-xs ${
                                        priceChange > 0 
                                          ? 'text-orange-600 dark:text-orange-400' 
                                          : 'text-blue-600 dark:text-blue-400'
                                      }`}>
                                        ({priceChange > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {item.reason}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Recommendations Empty State */}
        {recommendationsData.length === 0 && !recommendationsLoading && !recommendationsError && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Haz clic en &quot;Solicitar Recomendaciones&quot; para obtener sugerencias de precios
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Análisis impulsado por Amazon Bedrock
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Las predicciones y recomendaciones son generadas por Claude 3 Sonnet, 
              analizando tu historial de pedidos y datos de productos. Los resultados 
              son sugerencias que debes revisar antes de aplicar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
