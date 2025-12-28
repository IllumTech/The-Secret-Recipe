import ProductionCalendar from '@/components/admin/ProductionCalendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function CalendarioPage() {
  return (
    <div className="container-custom py-8">
      <ProductionCalendar />
    </div>
  );
}
