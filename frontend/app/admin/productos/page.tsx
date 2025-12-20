'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/products/ProductForm';

function ProductsListContent() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAnimating, setDeleteAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Abrir modal si viene el parámetro ?nuevo=true
  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      setIsModalOpen(true);
      // Limpiar el parámetro de la URL
      router.replace('/admin/productos');
    }
  }, [searchParams, router]);

  const activeProducts = products.filter(p => p.isActive);
  const filteredProducts = filterCategory === 'promocion'
    ? activeProducts.filter(p => p.isOnPromotion)
    : filterCategory === 'all' 
    ? activeProducts 
    : activeProducts.filter(p => p.category === filterCategory);

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
    setTimeout(() => setDeleteAnimating(true), 10);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      try {
        await deleteProduct(productToDelete.id);
        // Pequeño delay para mostrar el éxito
        setTimeout(() => {
          setIsDeleting(false);
          closeDeleteModal();
        }, 500);
      } catch (error) {
        setIsDeleting(false);
        alert('Error al eliminar el producto');
      }
    }
  };

  const cancelDelete = () => {
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteAnimating(false);
    setTimeout(() => {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }, 300);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: Partial<Product>) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await addProduct(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>);
      }
      // Pequeño delay para mostrar el éxito
      setTimeout(() => {
        setIsSaving(false);
        handleCloseModal();
      }, 500);
    } catch (error) {
      setIsSaving(false);
      alert('Error al guardar el producto');
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">Productos</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Crear Nuevo</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Filtrar por:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterCategory === 'all'}
              onClick={() => setFilterCategory('all')}
            >
              Todos ({activeProducts.length})
            </FilterButton>
            <FilterButton
              active={filterCategory === 'promocion'}
              onClick={() => setFilterCategory('promocion')}
            >
              🔥 Promos ({activeProducts.filter(p => p.isOnPromotion).length})
            </FilterButton>
            <FilterButton
              active={filterCategory === 'helado'}
              onClick={() => setFilterCategory('helado')}
            >
              Helados ({activeProducts.filter(p => p.category === 'helado').length})
            </FilterButton>
            <FilterButton
              active={filterCategory === 'postre'}
              onClick={() => setFilterCategory('postre')}
            >
              Postres ({activeProducts.filter(p => p.category === 'postre').length})
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Products List - Desktop Table / Mobile Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Precio</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-700 flex-shrink-0">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="text-3xl">{product.category === 'helado' ? '🍦' : '🍰'}</div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                          {product.isOnPromotion && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse">
                              🔥 OFERTA
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {product.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      product.category === 'helado' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {product.category === 'helado' ? 'Helado' : 'Postre'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.isOnPromotion && product.promotionalPrice ? (
                      <div>
                        <div className="text-sm text-slate-400 dark:text-slate-500 line-through">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          ${product.promotionalPrice.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-slate-100">${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-gray-700">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex gap-3">
                {product.imageUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-gray-700 flex-shrink-0">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
                    {product.category === 'helado' ? '🍦' : '🍰'}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    {product.isOnPromotion && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse flex-shrink-0">
                        🔥
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.category === 'helado' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {product.category === 'helado' ? '🍦 Helado' : '🍰 Postre'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {product.isOnPromotion && product.promotionalPrice ? (
                        <div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 line-through">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className="text-base font-bold text-red-600 dark:text-red-400">
                            ${product.promotionalPrice.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">${product.price.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="text-sm sm:text-base">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
      >
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && productToDelete && (
        <div 
          className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
            deleteAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={cancelDelete}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${
              deleteAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Eliminar Producto</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <p className="text-slate-700 dark:text-slate-300 mb-2">¿Estás seguro de que deseas eliminar este producto?</p>
              <div className="flex items-center gap-3 mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                <div className="text-2xl">{productToDelete.image || '📦'}</div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{productToDelete.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">${productToDelete.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-medium disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando productos...</p>
        </div>
      </div>
    }>
      <ProductsListContent />
    </Suspense>
  );
}

function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
          : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
