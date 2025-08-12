import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../global';
import Login from './components/LoginRegister';
import { logout, clearError } from '../global/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import { useAIChat } from './hooks/useAIChat';
import { ProductService } from './services/productService';
import type { Product, ComboProduct } from './types/product';
import CustomTamalCreator from './components/CustomTamalCreator';
import CustomBeverageCreator from './components/CustomBeverageCreator';
import OrderStatus from './components/OrderStatus';
import CreditCardPayment from './components/CreditCardPayment';
import type { CreateOrderRequest } from './types/order';
import type { CartItem } from './types/cart';

export default function StoreApp() {
  const dispatch = useAppDispatch();
  const { token, user, error } = useAppSelector((state) => state.auth);

  // Estados de la app
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCustomTamalModal, setShowCustomTamalModal] = useState(false);
  const [showCustomBeverageModal, setShowCustomBeverageModal] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderRequest | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('todos');

  // Hook del chat de IA con todas las funcionalidades de voz
  const {
    chatHistory,
    isTyping,
    sendMessage,
    clearChat,
    startRecording,
    stopRecording,
    isRecording,
    isPlaying,
  } = useAIChat(token);

  // Estado para productos
  const [products, setProducts] = useState<{
    tamales: Product[];
    bebidas: Product[];
    combos: ComboProduct[];
  }>({
    tamales: [],
    bebidas: [],
    combos: [],
  });

  const [productsLoading, setProductsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [currentStreamingMessage] = useState<string>('');

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await ProductService.getAllProducts();
        setProducts({
          tamales: data.tamales,
          bebidas: data.bebidas,
          combos: data.combos,
        });
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Error cargando productos');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Manejar errores de autenticación
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${user?.id || 'guest'}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, [user?.id]);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem(`cart_${user?.id || 'guest'}`, JSON.stringify(cart));
  }, [cart, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    setCart([]);
    localStorage.removeItem(`cart_${user?.id || 'guest'}`);
    toast.success('Sesión cerrada exitosamente');
  };

  // El modal de Login se cierra a sí mismo al detectar sesión iniciada

  const addToCart = (product: Product | ComboProduct | any) => {
    if (!token || !user) {
      setShowLoginModal(true);
      return;
    }

    const cartItem = {
      id: product.Id,
      name: product.Name,
      price: product.Price,
      quantity: product.quantity || 1,
    };

    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === cartItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item
        );
      }
      return [...prev, cartItem];
    });

    toast.success(`¡${cartItem.name} agregado al carrito!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    toast.success('Producto eliminado del carrito');
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    sendMessage(chatMessage);
    setChatMessage('');
  };

  const startVoiceCall = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      const success = await startRecording();
      if (success) {
        toast.success('Grabación iniciada - Habla ahora');
      }
    }
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    const data: CreateOrderRequest = {
      userId: user?.id?.toString() || '',
      confirmed: true,
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    setOrderData(data);
    setShowCart(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // La creación de la orden se realiza dentro de CreditCardPayment
      setCart([]);
      setShowPaymentModal(false);
      toast.success('¡Pedido realizado exitosamente! 🎉');
    } catch (error) {
      console.error('Error post-pago:', error);
      toast.error('Error al finalizar el pedido');
    }
  };

  // Obtener productos filtrados por categoría
  const getFilteredProducts = () => {
    switch (activeCategory) {
      case 'tamales':
        return products.tamales;
      case 'bebidas':
        return products.bebidas;
      case 'combos':
        return products.combos;
      default:
        return [...products.tamales, ...products.bebidas, ...products.combos];
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white border border-gray-300 rounded-lg shadow-md',
        }}
      />

      {/* Header Principal Minimalista */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Nombre */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-extrabold select-none">
                  C
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                  La Cazuela Chapina
                </h1>
                <p className="text-sm text-gray-500 font-light tracking-wide">
                  Sabores auténticos de Guatemala
                </p>
              </div>
            </div>

            {/* Acciones del Usuario */}
            <div className="flex items-center space-x-5">
              {token && user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-4 text-gray-700 text-sm select-none">
                    <span className="font-semibold">¡Hola, {user.name}!</span>
                    <button
                      onClick={() => setShowOrderStatus(true)}
                      className="text-orange-500 hover:text-orange-600 font-semibold transition"
                    >
                      Mis Órdenes
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCart(true)}
                    className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105"
                    aria-label="Ver carrito"
                  >
                    🛒 Carrito
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                        {getCartItemCount()}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 font-semibold transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header con Categorías */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center py-8 space-y-10">
            {/* Categorías en fila horizontal con iconos más pequeños */}
            <div className="flex justify-center gap-10 w-full max-w-4xl">
              {['tamales', 'bebidas', 'combos', 'al gusto'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
              flex items-center justify-center
              space-x-3
              px-6 py-3 rounded-2xl
              font-semibold text-lg
              transition-transform duration-300 ease-in-out
              shadow-md border border-transparent
              ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg transform scale-105 border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:shadow-lg hover:border-orange-300'
              }
              focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-60
            `}
                >
                  <span className="text-3xl select-none">
                    {cat === 'tamales'
                      ? '🫔'
                      : cat === 'bebidas'
                        ? '🥤'
                        : cat === 'combos'
                          ? '🍽️'
                          : '✨'}
                  </span>
                  <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Sección de personalización solo si "Al Gusto" está activo */}
            {activeCategory === 'al gusto' && (
              <div className="w-full mt-8 px-4">
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      title: 'Personalizar Tamal',
                      description:
                        'Elige tus ingredientes y rellenos favoritos.',
                      icon: '🫔',
                      onClick: () => setShowCustomTamalModal(true),
                      bgColor: 'bg-purple-600 hover:bg-purple-700',
                    },
                    {
                      title: 'Personalizar Bebida',
                      description: 'Crea la bebida perfecta a tu gusto.',
                      icon: '🥤',
                      onClick: () => setShowCustomBeverageModal(true),
                      bgColor: 'bg-blue-600 hover:bg-blue-700',
                    },
                  ].map(({ title, description, icon, onClick, bgColor }) => (
                    <div
                      key={title}
                      onClick={onClick}
                      className={`${bgColor} cursor-pointer rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center`}
                    >
                      <div className="text-6xl mb-4 select-none">{icon}</div>
                      <h3 className="text-xl font-bold mb-2">{title}</h3>
                      <p className="text-sm opacity-90">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {productsLoading ? (
          <div className="flex flex-col justify-center items-center py-24 text-gray-500">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-300"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent absolute top-0"></div>
            </div>
            <span className="mt-6 text-xl font-semibold">
              Cargando productos deliciosos...
            </span>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Grid de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.Id}
                  className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col p-6 text-center"
                >
                  {/* Ícono del Producto - Ahora es más grande */}
                  <div className="flex justify-center mb-4">
                    <span className="text-7xl select-none">
                      {product.Id.includes('tamal')
                        ? '🫔'
                        : product.Id.includes('bebida')
                          ? '🥤'
                          : '🍽️'}
                    </span>
                  </div>

                  {/* Contenido del Producto */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {product.Name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.Description}
                    </p>

                    <div className="mt-auto">
                      <span className="text-3xl font-bold text-orange-600">
                        ${product.Price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Agregar al Carrito */}
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 w-full"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay productos */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <div className="text-7xl mb-6 select-none animate-pulse">
                  🍽️
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  No hay productos en esta categoría
                </h3>
                <p className="text-lg max-w-md mx-auto">
                  Prueba seleccionando otra categoría o personaliza tu propio
                  producto.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAIChat(true)}
          className="bg-orange-600 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-400"
          aria-label="Chat IA"
        >
          <div className="w-10 h-10 flex items-center justify-center text-3xl select-none">
            🤖
          </div>
        </button>
      </div>

      {/* Cart Modal Moderno */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  🛒 Tu Carrito
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors hover:scale-110"
                >
                  ✕
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mt-2">
                  ¡Agrega algunos productos deliciosos!
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors hover:scale-110"
                        >
                          -
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors hover:scale-110"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors hover:scale-110"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">
                      Total ({getCartItemCount()} items):
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Proceder al Pago 💳
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Chat Modal Moderno */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🤖 Cazuela IA
                  {isTyping && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="bg-gray-200 hover:bg-gray-300 p-2 rounded-xl transition-colors hover:scale-105"
                    title="Limpiar chat"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={startVoiceCall}
                  className={`p-2 rounded-xl transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                  title={isRecording ? 'Detener grabación' : 'Grabar audio'}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>

                {isPlaying && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    Reproduciendo respuesta...
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isBot ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
                      msg.isBot
                        ? 'bg-gray-100 border border-gray-200'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    }`}
                  >
                    {msg.type === 'audio' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎵</span>
                        <span className="text-sm">
                          {msg.isBot
                            ? 'Respuesta de audio del AI'
                            : 'Audio enviado'}
                        </span>
                        {msg.isBot && (
                          <button
                            onClick={() => {
                              if (msg.content) {
                                // Reproducir audio usando el servicio
                                const audioBlob = new Blob([msg.content], {
                                  type: 'audio/wav',
                                });
                                const audioUrl = URL.createObjectURL(audioBlob);
                                const audio = new Audio(audioUrl);
                                audio.play();
                              }
                            }}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            🔊 Reproducir
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.message}
                      </p>
                    )}
                    <span
                      className={`text-xs block mt-2 ${
                        msg.isBot ? 'text-gray-500' : 'text-blue-100'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {currentStreamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 border border-gray-200 shadow-lg">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {currentStreamingMessage}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-gray-500">
                        Escribiendo...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Pregunta sobre productos, precios, ingredientes..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100"
                >
                  <span className="text-lg">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <Login onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {showCustomTamalModal && (
        <CustomTamalCreator
          onClose={() => setShowCustomTamalModal(false)}
          onSuccess={addToCart}
        />
      )}

      {showCustomBeverageModal && (
        <CustomBeverageCreator
          onClose={() => setShowCustomBeverageModal(false)}
          onSuccess={addToCart}
        />
      )}

      {showOrderStatus && token && user && (
        <OrderStatus onClose={() => setShowOrderStatus(false)} />
      )}

      {showPaymentModal && orderData && (
        <CreditCardPayment
          orderData={orderData}
          totalAmount={getCartTotal()}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
