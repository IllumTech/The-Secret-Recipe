'use client';

import { useEffect, useState, useCallback } from 'react';
import { Purchase, PurchaseCategory, PurchaseReport, CreatePurchaseInput, UpdatePurchaseInput } from '@/lib/types';
import { 
  getPurchases, 
  createPurchase, 
  updatePurchase, 
  deletePurchase, 
  getPurchaseReport,
  uploadImage 
} from '@/lib/api';
import { 
  Receipt, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const VALID_CATEGORIES: { value: PurchaseCategory; label: string }[] = [
  { value: 'ingredientes', label: 'Ingredientes' },
  { value: 'empaque', label: 'Empaque' },
  { value: 'decoracion', label: 'Decoración' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'otros', label: 'Otros' },
];

export default function PurchaseManagement() {
  // State for purchases list
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for filters
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterCategory, setFilterCategory] = useState<PurchaseCategory | ''>('');

  // State for form modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form fields
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<PurchaseCategory>('ingredientes');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for monthly report
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadPurchases = useCallback(async () => {
    try {
      setListLoading(true);
      setListError(null);
      const filters: { startDate?: string; endDate?: string; category?: PurchaseCategory } = {};
      if (filterStartDate) filters.startDate = filterStartDate.toISOString().split('T')[0];
      if (filterEndDate) filters.endDate = filterEndDate.toISOString().split('T')[0];
      if (filterCategory) filters.category = filterCategory;
      
      const data = await getPurchases(Object.keys(filters).length > 0 ? filters : undefined);
      setPurchases(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Error al cargar compras');
    } finally {
      setListLoading(false);
    }
  }, [filterStartDate, filterEndDate, filterCategory]);

  const loadReport = useCallback(async () => {
    try {
      setReportLoading(true);
      setReportError(null);
      const data = await getPurchaseReport({ month: selectedMonth, year: selectedYear });
      setReport(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Error al cargar reporte');
    } finally {
      setReportLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);


  const resetForm = () => {
    setFormAmount('');
    setFormDate(null);
    setFormDescription('');
    setFormCategory('ingredientes');
    setFormImageUrl('');
    setFormError(null);
    setFormSuccess(false);
    setEditingPurchase(null);
  };

  const openCreateModal = () => {
    resetForm();
    setFormDate(new Date());
    setIsFormModalOpen(true);
  };

  const openEditModal = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormAmount(purchase.amount.toString());
    setFormDate(new Date(purchase.purchaseDate));
    setFormDescription(purchase.description);
    setFormCategory(purchase.category);
    setFormImageUrl(purchase.receiptImageUrl || '');
    setFormError(null);
    setFormSuccess(false);
    setIsFormModalOpen(true);
  };

  const openDetailModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsImageExpanded(false);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
    setIsDeleteModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const result = await uploadImage(file);
      setFormImageUrl(result.imageUrl);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('El monto debe ser un número positivo mayor a cero');
      return;
    }

    if (!formDate) {
      setFormError('La fecha es requerida');
      return;
    }

    if (!formDescription.trim()) {
      setFormError('La descripción es requerida');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      setFormSuccess(false);

      if (editingPurchase) {
        const updateData: UpdatePurchaseInput = {
          amount,
          purchaseDate: formDate!.toISOString().split('T')[0],
          description: formDescription.trim(),
          category: formCategory,
        };
        if (formImageUrl) updateData.receiptImageUrl = formImageUrl;
        
        await updatePurchase(editingPurchase.id, updateData);
      } else {
        const createData: CreatePurchaseInput = {
          amount,
          purchaseDate: formDate!.toISOString().split('T')[0],
          description: formDescription.trim(),
          category: formCategory,
        };
        if (formImageUrl) createData.receiptImageUrl = formImageUrl;
        
        await createPurchase(createData);
      }

      setFormSuccess(true);
      await Promise.all([loadPurchases(), loadReport()]);

      setTimeout(() => {
        setFormSuccess(false);
        setIsFormModalOpen(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar compra');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;

    try {
      setDeleteLoading(true);
      await deletePurchase(purchaseToDelete.id);
      await Promise.all([loadPurchases(), loadReport()]);
      setIsDeleteModalOpen(false);
      setPurchaseToDelete(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al eliminar compra');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getCategoryLabel = (category: PurchaseCategory) => {
    return VALID_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: PurchaseCategory) => {
    const colors: Record<PurchaseCategory, string> = {
      ingredientes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      empaque: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      decoracion: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      equipo: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      otros: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    };
    return colors[category];
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Registro de Compras
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Gestiona las compras de insumos y comprobantes
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Compra</span>
            </button>
            <Receipt className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters and Purchases Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Historial de Compras
        </h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="filterStartDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fecha Inicio
            </label>
            <DatePicker
              selected={filterStartDate}
              onChange={(date: Date | null) => setFilterStartDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona fecha"
              maxDate={new Date()}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              calendarClassName="shadow-xl"
              wrapperClassName="w-full"
              isClearable
            />
          </div>
          <div>
            <label htmlFor="filterEndDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fecha Fin
            </label>
            <DatePicker
              selected={filterEndDate}
              onChange={(date: Date | null) => setFilterEndDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona fecha"
              minDate={filterStartDate || undefined}
              maxDate={new Date()}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              calendarClassName="shadow-xl"
              wrapperClassName="w-full"
              isClearable
            />
          </div>
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Categoría
            </label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as PurchaseCategory | '')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              <option value="">Todas</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {listLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {listError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>{listError}</span>
            </div>
          </div>
        )}

        {!listLoading && !listError && purchases.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No hay compras registradas
            </p>
          </div>
        )}

        {!listLoading && !listError && purchases.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {purchases.map((purchase) => (
                  <tr 
                    key={purchase.id}
                    className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(purchase.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(purchase.category)}`}>
                        {getCategoryLabel(purchase.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white max-w-xs truncate">
                        {purchase.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openDetailModal(purchase)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(purchase)}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(purchase)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Monthly Report */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Reporte Mensual de Compras
        </h3>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reportMonth" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mes
            </label>
            <select
              id="reportMonth"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .filter(month => {
                  const currentYear = new Date().getFullYear();
                  const currentMonth = new Date().getMonth() + 1;
                  if (selectedYear < currentYear) return true;
                  if (selectedYear === currentYear) return month <= currentMonth;
                  return false;
                })
                .map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleDateString('es-ES', { month: 'long' })}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="reportYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Año
            </label>
            <select
              id="reportYear"
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

        {reportLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {reportError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>{reportError}</span>
            </div>
          </div>
        )}

        {!reportLoading && !reportError && report && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      Total de Gastos
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(report.totalAmount)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                      Número de Compras
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {report.purchaseCount}
                    </p>
                  </div>
                  <Receipt className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {report.byCategory.length > 0 ? (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Desglose por Categoría
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Compras
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          % del Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {report.byCategory
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((item) => {
                          const percentage = report.totalAmount > 0 
                            ? (item.totalAmount / report.totalAmount) * 100 
                            : 0;
                          return (
                            <tr 
                              key={item.category}
                              className="bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                                  {getCategoryLabel(item.category)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-white">
                                {item.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {formatCurrency(item.totalAmount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <div className="w-24 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
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
                  No hay compras registradas para este mes
                </p>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Form Modal (Create/Edit) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={editingPurchase ? 'Editar Compra' : 'Nueva Compra'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto y Fecha en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="formAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monto Total *
              </label>
              <input
                type="number"
                id="formAmount"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="formDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fecha de Compra *
              </label>
              <DatePicker
                selected={formDate}
                onChange={(date: Date | null) => setFormDate(date)}
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                placeholderText="Selecciona fecha"
                className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                calendarClassName="shadow-xl"
                wrapperClassName="w-full"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="formCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Categoría *
            </label>
            <select
              id="formCategory"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as PurchaseCategory)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
              required
            >
              {VALID_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción y Comprobante en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="formDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Descripción *
              </label>
              <textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white resize-none"
                placeholder="Describe los insumos comprados..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Comprobante (opcional)
              </label>
              {formImageUrl ? (
                <div className="relative h-[104px]">
                  <img 
                    src={formImageUrl} 
                    alt="Comprobante" 
                    className="h-full w-full object-cover rounded-lg border border-slate-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-[104px] border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                  {imageUploading ? (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span>Subiendo...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-sm">Subir comprobante</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span>{formError}</span>
              </div>
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <AlertCircle className="w-5 h-5" />
                <span>{editingPurchase ? 'Compra actualizada exitosamente' : 'Compra registrada exitosamente'}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={formLoading || imageUploading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {formLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                <span>{editingPurchase ? 'Actualizar Compra' : 'Registrar Compra'}</span>
              </>
            )}
          </button>
        </form>
      </Modal>


      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPurchase(null);
          setIsImageExpanded(false);
        }}
        title="Detalle de Compra"
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fecha</p>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {formatDate(selectedPurchase.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Monto</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedPurchase.amount)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Categoría</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getCategoryColor(selectedPurchase.category)}`}>
                {getCategoryLabel(selectedPurchase.category)}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Descripción</p>
              <p className="text-slate-900 dark:text-white mt-1">
                {selectedPurchase.description}
              </p>
            </div>

            {selectedPurchase.receiptImageUrl && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Comprobante</p>
                <div className="relative">
                  <img 
                    src={selectedPurchase.receiptImageUrl} 
                    alt="Comprobante de compra"
                    className={`rounded-lg border border-slate-300 dark:border-gray-600 cursor-pointer transition-all ${
                      isImageExpanded ? 'max-w-full' : 'max-h-48 w-auto'
                    }`}
                    onClick={() => setIsImageExpanded(!isImageExpanded)}
                  />
                  <button
                    onClick={() => setIsImageExpanded(!isImageExpanded)}
                    className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Haz clic en la imagen para {isImageExpanded ? 'reducir' : 'ampliar'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Creado</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(selectedPurchase.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Actualizado</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(selectedPurchase.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPurchaseToDelete(null);
        }}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-lg font-medium">¿Estás seguro?</p>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400">
            Esta acción eliminará permanentemente la compra:
          </p>
          
          {purchaseToDelete && (
            <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(purchaseToDelete.amount)} - {getCategoryLabel(purchaseToDelete.category)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {purchaseToDelete.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Fecha: {formatDate(purchaseToDelete.purchaseDate)}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPurchaseToDelete(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
