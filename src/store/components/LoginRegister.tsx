import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../global';
import { loginUser, registerUser } from '../../global/authSlice';
import toast from 'react-hot-toast';

interface LoginProps {
  onClose?: () => void;
}

export default function Login({ onClose }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error, token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && user && onClose && loginSuccess) {
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        console.log('Ejecutando onClose...');
        onClose();
      }, 500);
    }
  }, [token, user, onClose, loginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) setLoginSuccess(true);
    } else {
      const result = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(result)) {
        toast.success('¡Cuenta creada exitosamente! Ahora inicia sesión.');
        setIsLogin(true);
        setEmail(email);
        setPassword('');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h2>
        <p className="text-gray-600">
          {isLogin
            ? 'Accede a tu tienda personalizada'
            : 'Únete a nuestra plataforma'}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required={!isLogin}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
            </div>
          ) : isLogin ? (
            'Iniciar Sesión'
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-700 font-medium transition duration-200 hover:underline"
        >
          {isLogin
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>

      {onClose && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium transition duration-200 hover:underline"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
