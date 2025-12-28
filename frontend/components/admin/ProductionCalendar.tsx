'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfMonth, endOfMonth, addMonths, subMonths, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarOrders, getOrdersByDate } from '@/lib/api';
import { Order, CalendarOrder } from '@/lib/types';
import { X, Package, User, MapPin, Calendar as CalendarIcon } from 'lucide-react';

// Configure date-fns localizer for react-big-calendar
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 0, // Sunday
  getDay: (date: Date | string | number) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.getDay();
  },
  locales,
});

interface CalendarEvent extends Event {
  resource: {
    orderCount: number;
    date: string;
  };
}

export default function ProductionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch calendar data for the current month
  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');
      
      const response = await getCalendarOrders({ startDate, endDate });
      
      // Transform the response to CalendarOrder format
      const transformedData: CalendarOrder[] = response.dates?.map((date: string) => ({
        date,
        orderCount: response.orderCounts[date] || 0,
        orders: response.ordersByDate[date] || []
      })) || [];
      
      setCalendarData(transformedData);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Error al cargar el calendario de producción');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Convert calendar data to events for react-big-calendar
  const events: CalendarEvent[] = useMemo(() => {
    return calendarData.map((item) => {
      const date = parse(item.date, 'yyyy-MM-dd', new Date());
      return {
        title: `${item.orderCount} pedido${item.orderCount !== 1 ? 's' : ''}`,
        start: startOfDay(date),
        end: startOfDay(date),
        allDay: true,
        resource: {
          orderCount: item.orderCount,
          date: item.date,
        },
      };
    });
  }, [calendarData]);

  // Handle date selection
  const handleSelectEvent = async (event: CalendarEvent) => {
    const dateStr = event.resource.date;
    setSelectedDate(dateStr);
    setShowModal(true);
    setLoadingOrders(true);
    
    try {
      const response = await getOrdersByDate(dateStr);
      // The API returns { date, orders, count }
      setSelectedOrders(response.orders || []);
    } catch (err) {
      console.error('Error fetching orders for date:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle month navigation
  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (action === 'NEXT') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date());
    }
  };

  // Custom event style based on order count
  const eventStyleGetter = (event: CalendarEvent) => {
    const count = event.resource.orderCount;
    let backgroundColor = '#10b981'; // green-500
    
    if (count >= 10) {
      backgroundColor = '#dc2626'; // red-600 - high volume
    } else if (count >= 5) {
      backgroundColor = '#f59e0b'; // amber-500 - medium volume
    } else if (count >= 3) {
      backgroundColor = '#3b82f6'; // blue-500 - moderate volume
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedOrders([]);
  };

  if (loading && calendarData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendario de Producción
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza y planifica tus pedidos por fecha de entrega
          </p>
        </div>
        <button
          onClick={() => handleNavigate('TODAY')}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Volumen de Pedidos
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">1-2 pedidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">3-4 pedidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">5-9 pedidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">10+ pedidos</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm calendar-container">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          views={['month']}
          defaultView="month"
          culture="es"
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Pedido',
            noEventsInRange: 'No hay pedidos en este rango de fechas',
            showMore: (total) => `+ Ver ${total} más`,
          }}
        />
      </div>

      {/* Order Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pedidos para {selectedDate && format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: es })}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOrders.length} pedido{selectedOrders.length !== 1 ? 's' : ''} programado{selectedOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingOrders ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando pedidos...</p>
                  </div>
                </div>
              ) : selectedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No hay pedidos para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Pedido #{order.orderNumber}
                          </h4>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {order.status === 'completed' ? 'Completado' :
                             order.status === 'processing' ? 'En proceso' :
                             order.status === 'cancelled' ? 'Cancelado' :
                             'Pendiente'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                          {order.deliveryTime && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.deliveryTime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {order.customerEmail}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {order.customerPhone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {order.deliveryAddress.street}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Productos ({order.items.length})
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                              <span>{item.product.name} x {item.quantity}</span>
                              <span className="font-medium">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.productionNotes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Notas de producción:</span> {order.productionNotes}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <a
                          href={`/admin/pedidos/${order.id}`}
                          className="text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
                        >
                          Ver detalles completos →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
