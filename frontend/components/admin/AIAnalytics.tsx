'use client';

import { useState } from 'react';
import { getDemandForecast, getPriceRecommendations } from '@/lib/api';
import { Brain, TrendingUp, DollarSign, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

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

  // Price Recommendations State
  const [recommendationsData, setRecommendationsData] = useState<RecommendationItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

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

        {/* Forecast Results Table */}
        {forecastData.length > 0 && !forecastLoading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cantidad Sugerida
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {forecastData.map((item, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.product}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(item.day)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.quantity} unidades
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Forecast Empty State */}
        {forecastData.length === 0 && !forecastLoading && !forecastError && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Haz clic en "Solicitar Pronóstico" para obtener predicciones de demanda
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Precio Actual
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Precio Sugerido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Justificación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {recommendationsData.map((item, index) => {
                  const priceChange = item.suggestedPrice - item.currentPrice;
                  const priceChangePercent = (priceChange / item.currentPrice) * 100;
                  const maintainPrice = shouldMaintainPrice(item.reason);

                  return (
                    <tr 
                      key={index}
                      className={`hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${
                        maintainPrice 
                          ? 'bg-green-50 dark:bg-green-900/10' 
                          : priceChange > 0 
                            ? 'bg-orange-50 dark:bg-orange-900/10' 
                            : 'bg-blue-50 dark:bg-blue-900/10'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.product}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${item.currentPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${
                            maintainPrice 
                              ? 'text-green-700 dark:text-green-400' 
                              : priceChange > 0 
                                ? 'text-orange-700 dark:text-orange-400' 
                                : 'text-blue-700 dark:text-blue-400'
                          }`}>
                            ${item.suggestedPrice.toFixed(2)}
                          </span>
                          {!maintainPrice && priceChange !== 0 && (
                            <span className={`text-xs ${
                              priceChange > 0 
                                ? 'text-orange-600 dark:text-orange-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {priceChange > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2">
                          {maintainPrice ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              ✓ Mantener precio
                            </span>
                          ) : priceChange > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                              ↑ Aumentar
                            </span>
                          ) : priceChange < 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              ↓ Reducir
                            </span>
                          ) : null}
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {item.reason}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Recommendations Empty State */}
        {recommendationsData.length === 0 && !recommendationsLoading && !recommendationsError && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Haz clic en "Solicitar Recomendaciones" para obtener sugerencias de precios
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
