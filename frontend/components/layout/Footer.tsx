export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-4xl">🍦</span>
              <h3 className="text-2xl font-bold font-display">The Secret Recipe</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Creando momentos dulces e inolvidables con los mejores helados y postres artesanales. 
              Cada producto es una obra de arte hecha con amor y los ingredientes más finos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-xl">🐦</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 font-display">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2">
                  <span>→</span>
                  <span>Inicio</span>
                </a>
              </li>
              <li>
                <a href="/carrito" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2">
                  <span>→</span>
                  <span>Carrito</span>
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-300 hover:text-primary-400 transition-colors flex items-center space-x-2">
                  <span>→</span>
                  <span>Admin</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 font-display">Contacto</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-primary-400">📧</span>
                <span>info@thesecretrecipe.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-400">📱</span>
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-400">📍</span>
                <span>123 Sweet Street, Dessert City</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 The Secret Recipe. Todos los derechos reservados. 
            <span className="mx-2">|</span>
            Hecho con <span className="text-primary-500">❤️</span> y mucho azúcar
          </p>
        </div>
      </div>
    </footer>
  );
}
