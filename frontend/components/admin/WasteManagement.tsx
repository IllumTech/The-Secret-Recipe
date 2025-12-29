'use client';

import { useEffect, useState, useCallback } from 'react';
import { Product, WasteEntry, WasteReport } from '@/lib/types';
import { getProducts, createWasteEntry, getWasteEntries, getWasteReport } from '@/lib/api';
import { Trash2, AlertCircle, TrendingDown, Calendar, DollarSign, Package, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function WasteManagement() {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for waste entry form
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<'expired' | 'damaged' | 'other'>('expired');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // State for waste history
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for monthly report
  const [report, setReport] = useState<WasteReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadProducts = useCallback(async () => {
    try {
      const allProducts = await getProducts();
      // Filter active products with production cost
      const productsWithCost = allProducts.filter(
        p => p.isActive && p.productionCost !== undefined && p.productionCost !== null
      );
      setProducts(productsWithCost);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  const loadWasteEntries = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const params = startDate || endDate ? { startDate, endDate } : undefined;
      const entries = await getWasteEntries(params);
      setWasteEntries(entries);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Error al cargar historial de mermas');
    } finally {
      setHistoryLoading(false);
    }
  }, [startDate, endDate]);

  const loadWasteReport = useCallback(async () => {
    try {
      setReportLoading(true);
      setReportError(null);
      const reportData = await getWasteReport({ month: selectedMonth, year: selectedYear });
      setReport(reportData);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Error al cargar reporte de mermas');
    } finally {
      setReportLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadProducts();
    loadWasteEntries();
    loadWasteReport();
  }, [loadProducts, loadWasteEntries, loadWasteReport]);

  useEffect(() => {
    loadWasteReport();
  }, [loadWasteReport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !quantity) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setFormError('La cantidad debe ser un número positivo');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      setFormSuccess(false);

      await createWasteEntry({
        productId: selectedProductId,
        quantity: quantityNum,
        reason,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString()
      });

      // Clear form
      setSelectedProductId('');
      setQuantity('');
      setReason('expired');
      setNotes('');
      setFormSuccess(true);

      // Reload data
      await Promise.all([
        loadWasteEntries(),
        loadWasteReport()
      ]);

      // Close modal and hide success message after 2 seconds
      setTimeout(() => {
        setFormSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al registrar merma');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDateFilter = () => {
    loadWasteEntries();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      expired: 'Caducado',
      damaged: 'Dañado',
      other: 'Otro'
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Gestión de Mermas
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Registra y analiza productos desperdiciados
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Merma</span>
            </button>
            <Trash2 className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Waste Entry Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFormSuccess(false);
        }}
        title="Registrar Nueva Merma"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selector */}
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Producto *
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              required
            >
              <option value="">Selecciona un producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.productionCost?.toFixed(2)} (Stock: {product.stockQuantity || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Cantidad desperdiciada"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Motivo *
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as 'expired' | 'damaged' | 'other')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              required
            >
              <option value="expired">Caducado</option>
              <option value="damaged">Dañado</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* Error Message */}
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span>{formError}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {formSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <AlertCircle className="w-5 h-5" />
                <span>Merma registrada exitosamente</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {formLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Registrar Merma</span>
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* Waste History List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Historial de Mermas
        </h3>

        {/* Date Range Filter */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateFilter}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Loading State */}
        {historyLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {historyError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>{historyError}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!historyLoading && !historyError && wasteEntries.length === 0 && (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No hay registros de mermas
            </p>
          </div>
        )}

        {/* Waste Entries Table */}
        {!historyLoading && !historyError && wasteEntries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Costo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {wasteEntries.map((entry) => (
                  <tr 
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {entry.productName}
                      </div>
                      {entry.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {entry.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-white">
                      {entry.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.reason === 'expired' 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : entry.reason === 'damaged'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
                      }`}>
                        {getReasonLabel(entry.reason)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ${entry.financialImpact.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Waste Report */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Reporte Mensual de Mermas
        </h3>

        {/* Month Selector */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mes
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString('es-ES', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Año
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {reportLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {reportError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>{reportError}</span>
            </div>
          </div>
        )}

        {/* Report Content */}
        {!reportLoading && !reportError && report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                      Costo Total de Mermas
                    </p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                      ${report.totalWasteCost.toFixed(2)}
                    </p>
                  </div>
                  <TrendingDown className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                      Total de Registros
                    </p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {report.wasteEntryCount}
                    </p>
                  </div>
                  <Trash2 className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Breakdown by Product */}
            {report.wasteByProduct.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Desglose por Producto
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Cantidad Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Costo Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          % del Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {report.wasteByProduct
                        .sort((a, b) => b.totalCost - a.totalCost)
                        .map((item) => {
                          const percentage = (item.totalCost / report.totalWasteCost) * 100;
                          return (
                            <tr 
                              key={item.productId}
                              className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {item.productName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {item.entries.length} registro(s)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-white">
                                {item.totalQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                  ${item.totalCost.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <div className="w-24 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-red-600 dark:bg-red-500 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  No hay mermas registradas para este mes
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
