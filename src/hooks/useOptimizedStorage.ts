import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SecureStorage } from '../utils/security';

// Hook optimizado para storage con debouncing y memorización
export function useOptimizedStorage<T>(
  key: string,
  initialValue: T,
  options: {
    debounceMs?: number;
    encrypt?: boolean;
    validate?: (value: T) => boolean;
  } = {}
) {
  const {
    debounceMs = 300,
    validate = () => true
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValue = useRef<T>(initialValue);

  // Memoizar la clave para evitar recreaciones
  const storageKey = useMemo(() => key, [key]);

  // Cargar valor inicial desde storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const storedValue = await SecureStorage.getItem(storageKey);
        
        if (storedValue !== null && validate(storedValue)) {
          setValue(storedValue);
          lastSavedValue.current = storedValue;
        }
      } catch (error) {
        console.error(`Error cargando valor de storage para ${storageKey}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [storageKey, validate]);

  // Función optimizada para guardar con debouncing
  const saveValue = useCallback(async (newValue: T) => {
    if (!validate(newValue)) {
      console.warn(`Valor inválido para ${storageKey}:`, newValue);
      return;
    }

    // Evitar guardar si el valor no cambió
    if (JSON.stringify(newValue) === JSON.stringify(lastSavedValue.current)) {
      return;
    }

    // Limpiar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Nuevo debounce
    debounceRef.current = setTimeout(async () => {
      try {
        await SecureStorage.setItem(storageKey, newValue);
        lastSavedValue.current = newValue;
      } catch (error) {
        console.error(`Error guardando valor en storage para ${storageKey}:`, error);
      }
    }, debounceMs);
  }, [storageKey, debounceMs, validate]);

  // Función para actualizar valor
  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;

    setValue(finalValue);
    saveValue(finalValue);
  }, [value, saveValue]);

  // Función para limpiar storage
  const clearStorage = useCallback(() => {
    SecureStorage.removeItem(storageKey);
    setValue(initialValue);
    lastSavedValue.current = initialValue;
  }, [storageKey, initialValue]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: updateValue,
    isLoading,
    clearStorage,
    hasValue: SecureStorage.hasItem(storageKey)
  };
}

// Hook para storage del carrito optimizado
export function useCartStorage(userId: string | null) {
  const cartKey = useMemo(() => 
    userId ? `cart_${userId}` : null, 
    [userId]
  );

  const {
    value: cart,
    setValue: setCart,
    isLoading: cartLoading,
    clearStorage: clearCart
  } = useOptimizedStorage<any[]>(
    cartKey || 'temp_cart',
    [],
    {
      debounceMs: 500, // Debounce más largo para el carrito
      validate: (value) => Array.isArray(value)
    }
  );

  // Función optimizada para añadir al carrito
  const addToCart = useCallback((product: any) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id || item.Id === product.Id
      );

      if (existingItemIndex >= 0) {
        // Incrementar cantidad si ya existe
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      } else {
        // Añadir nuevo item
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, [setCart]);

  // Función optimizada para remover del carrito
  const removeFromCart = useCallback((index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  }, [setCart]);

  // Función optimizada para actualizar cantidad
  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart(prevCart => 
      prevCart.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    );
  }, [setCart, removeFromCart]);

  // Calcular total de forma memorizada
  const total = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  // Calcular cantidad total de items
  const itemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isLoading: cartLoading
  };
}

// Hook para storage de sesión optimizado
export function useSessionStorage() {
  const {
    value: token,
    setValue: setToken,
    clearStorage: clearToken
  } = useOptimizedStorage<string | null>('token', null, {
    encrypt: true,
    debounceMs: 100
  });

  const {
    value: user,
    setValue: setUser,
    clearStorage: clearUser
  } = useOptimizedStorage<any | null>('user', null, {
    encrypt: true,
    debounceMs: 100
  });

  const {
    value: refreshToken,
    setValue: setRefreshToken,
    clearStorage: clearRefreshToken
  } = useOptimizedStorage<string | null>('refreshToken', null, {
    encrypt: true,
    debounceMs: 100
  });

  // Función para limpiar toda la sesión
  const clearSession = useCallback(() => {
    clearToken();
    clearUser();
    clearRefreshToken();
  }, [clearToken, clearUser, clearRefreshToken]);

  return {
    token,
    setToken,
    user,
    setUser,
    refreshToken,
    setRefreshToken,
    clearSession,
    isAuthenticated: !!token && !!user
  };
}
