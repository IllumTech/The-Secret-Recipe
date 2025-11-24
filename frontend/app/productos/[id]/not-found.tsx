import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-custom py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Producto no encontrado
      </h1>
      <p className="text-gray-600 mb-8">
        Lo sentimos, el producto que buscas no existe.
      </p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
