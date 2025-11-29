'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/products/ProductForm';

export default function ProductsListPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Abrir modal si viene el parámetro ?nuevo=true
  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      setIsModalOpen(true);
      // Limpiar el parámetro de la URL
      router.replace('/admin/productos');
    }
  }, [searchParams, router]);

  const activeProducts = products.filter(p => p.isActive);
  const filteredProducts = filterCategory === 'all' 
    ? activeProducts 
    : activeProducts.filter(p => p.category === filterCategory);

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(id);
    }
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

  const handleSubmit = (data: Partial<Product>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data as Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Productos</h1>
          <p className="text-slate-600">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Crear Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filtrar por:</span>
          <div className="flex gap-2">
            <FilterButton
              active={filterCategory === 'all'}
              onClick={() => setFilterCategory('all')}
            >
              Todos ({activeProducts.length})
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

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Precio</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{product.image || '📦'}</div>
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-sm text-slate-500 line-clamp-1">
                          {product.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      product.category === 'helado' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {product.category === 'helado' ? '🍦 Helado' : '🍰 Postre'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No se encontraron productos</p>
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
        />
      </Modal>
    </div>
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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
