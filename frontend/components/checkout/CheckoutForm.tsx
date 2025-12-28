'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import * as api from '@/lib/api';
import OrderConfirmationModal from './OrderConfirmationModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FormData {
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryDate: Date | null;
  deliveryTime: string;
  productionNotes: string;
}

interface FormErrors {
  customerName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  productionNotes?: string;
}

interface CheckoutFormProps {
  onOrderComplete?: () => void;
}

export default function CheckoutForm({ onOrderComplete }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [leadTimeError, setLeadTimeError] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryDate: null,
    deliveryTime: '',
    productionNotes: '',
  });

  // Calculate minimum delivery date based on maximum lead time in cart
  const getMinimumDeliveryDate = (): Date => {
    const maxLeadTimeHours = items.reduce((max, item) => {
      const leadTime = item.product.leadTimeHours || 24; // Default 24 hours
      return Math.max(max, leadTime);
    }, 0); // Start from 0 to not override smaller values

    // If no items or all items have no lead time, use default 24 hours
    const effectiveLeadTime = maxLeadTimeHours > 0 ? maxLeadTimeHours : 24;

    const now = new Date();
    const currentHour = now.getHours();
    
    // Business hours: 8 AM - 8 PM (20:00)
    const CLOSING_HOUR = 20;
    
    // Calculate the earliest possible delivery time
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + effectiveLeadTime);
    
    // If the minimum delivery time is after closing hour (8 PM), 
    // we need to move to the next day
    if (minDate.getHours() >= CLOSING_HOUR || 
        (minDate.getHours() === CLOSING_HOUR - 1 && minDate.getMinutes() > 0)) {
      // Move to next day at opening time (8 AM)
      minDate.setDate(minDate.getDate() + 1);
      minDate.setHours(8, 0, 0, 0);
    }
    
    // Also check if we're currently past closing time
    // If it's after 8 PM now, the earliest delivery is tomorrow
    if (currentHour >= CLOSING_HOUR) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      
      // Return the later of the two dates
      return minDate > tomorrow ? minDate : tomorrow;
    }
    
    return minDate;
  };

  const minDeliveryDate = getMinimumDeliveryDate();
  const maxLeadTimeHours = items.reduce((max, item) => {
    const leadTime = item.product.leadTimeHours || 24;
    return Math.max(max, leadTime);
  }, 0); // Start from 0 to not override smaller values

  // Format lead time message
  const formatLeadTimeMessage = (hours: number): string => {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (hours === 24) {
      return '1 día (24 horas)';
    } else {
      const days = Math.ceil(hours / 24);
      return `${days} ${days === 1 ? 'día' : 'días'} (${hours} horas)`;
    }
  };

  // Get available time slots based on selected date and lead time
  const getAvailableTimeSlots = (): Array<{ value: string; label: string; disabled: boolean }> => {
    const allSlots = [
      { value: '08:00-10:00', label: '8:00 AM - 10:00 AM', startHour: 8, endHour: 10 },
      { value: '10:00-12:00', label: '10:00 AM - 12:00 PM', startHour: 10, endHour: 12 },
      { value: '12:00-14:00', label: '12:00 PM - 2:00 PM', startHour: 12, endHour: 14 },
      { value: '14:00-16:00', label: '2:00 PM - 4:00 PM', startHour: 14, endHour: 16 },
      { value: '16:00-18:00', label: '4:00 PM - 6:00 PM', startHour: 16, endHour: 18 },
      { value: '18:00-20:00', label: '6:00 PM - 8:00 PM', startHour: 18, endHour: 20 },
    ];

    // If no date selected, show all slots
    if (!formData.deliveryDate) {
      return allSlots.map(slot => ({ ...slot, disabled: false }));
    }

    const selectedDate = new Date(formData.deliveryDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = selectedDate.getTime() === today.getTime();

    // If not today, all slots are available
    if (!isToday) {
      return allSlots.map(slot => ({ ...slot, disabled: false }));
    }

    // For today, calculate which slots are still available based on current time + lead time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInHours = currentHour + currentMinute / 60;
    
    // Add lead time to current time
    const earliestDeliveryTime = currentTimeInHours + (maxLeadTimeHours || 24);

    return allSlots.map(slot => {
      // A slot is available if its start time is after the earliest delivery time
      const isAvailable = slot.startHour >= earliestDeliveryTime;
      return {
        ...slot,
        disabled: !isAvailable
      };
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'La calle es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'El estado es requerido';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'La fecha de entrega es requerida';
    } else {
      if (formData.deliveryDate < minDeliveryDate) {
        newErrors.deliveryDate = `La fecha debe ser al menos ${formatLeadTimeMessage(maxLeadTimeHours)} desde ahora`;
      }
    }

    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'La hora de entrega es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLeadTimeError('');

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image,
          imageUrl: item.product.imageUrl,
        })),
        deliveryDate: formData.deliveryDate ? formData.deliveryDate.toISOString().split('T')[0] : undefined,
        deliveryTime: formData.deliveryTime,
        productionNotes: formData.productionNotes || undefined,
      };

      const order = await api.createOrder(orderData);
      console.log('Order created:', order);
      
      setOrderNumber(order.orderNumber);
      console.log('Setting modal to true with order number:', order.orderNumber);
      setShowModal(true);
      onOrderComplete?.();
      clearCart();
    } catch (error: any) {
      console.error('Error submitting order:', error);
      
      // Handle lead time validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        
        // Check if it's a lead time error
        if (errorMessage.includes('requires at least') && errorMessage.includes('hours notice')) {
          setLeadTimeError(errorMessage);
          
          // Scroll to delivery date section
          const deliverySection = document.getElementById('delivery-date-section');
          if (deliverySection) {
            deliverySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          alert(errorMessage);
        }
      } else {
        alert('Error al procesar el pedido. Por favor intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, deliveryDate: date }));
    // Clear errors
    if (errors.deliveryDate) {
      setErrors(prev => ({ ...prev, deliveryDate: undefined }));
    }
    // Clear lead time error when date changes
    if (leadTimeError) {
      setLeadTimeError('');
    }
  };

  return (
    <>
      <OrderConfirmationModal 
        isOpen={showModal}
        orderNumber={orderNumber}
        onClose={handleCloseModal}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Información del Cliente</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Juan Pérez"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="+1 234 567 8900"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dirección de Entrega</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Calle y Número *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Av. Principal 123"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ciudad de México"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="CDMX"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código Postal *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="12345"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6" id="delivery-date-section">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Fecha y Hora de Entrega</h2>
        
        {leadTimeError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Error de tiempo de anticipación</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{leadTimeError}</p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                  Por favor, selecciona una fecha posterior (mínimo {formatLeadTimeMessage(maxLeadTimeHours)} desde ahora).
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Tiempo de anticipación requerido</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Los productos en tu carrito requieren al menos <strong>{formatLeadTimeMessage(maxLeadTimeHours)}</strong> de anticipación. Por favor, selecciona una fecha a partir del {minDeliveryDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Entrega *
            </label>
            <DatePicker
              selected={formData.deliveryDate}
              onChange={handleDateChange}
              minDate={minDeliveryDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona una fecha"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.deliveryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              calendarClassName="shadow-xl"
              wrapperClassName="w-full"
            />
            {errors.deliveryDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deliveryDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de Entrega *
            </label>
            <select
              id="deliveryTime"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.deliveryTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Selecciona una hora</option>
              {availableTimeSlots.map(slot => (
                <option 
                  key={slot.value} 
                  value={slot.value}
                  disabled={slot.disabled}
                >
                  {slot.label} {slot.disabled ? '(No disponible)' : ''}
                </option>
              ))}
            </select>
            {errors.deliveryTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deliveryTime}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="productionNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas de Producción (Opcional)
          </label>
          <textarea
            id="productionNotes"
            name="productionNotes"
            value={formData.productionNotes}
            onChange={(e) => {
              const { name, value } = e.target;
              setFormData(prev => ({ ...prev, [name]: value }));
            }}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Instrucciones especiales para la producción..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
      </button>
      </form>
    </>
  );
}
