import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);

      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          toast.error(`Cannot add more. Only ${product.stock} items in stock.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      if (quantity > product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} items in stock.`);
        return prevCart;
      }

      toast.success('Added to cart');
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity < 1) return;

    // We need stock info. If not passed, we might need to find it in cart if we start storing it there.
    // Ideally product object in cart has stock.

    setCart(prevCart => {
      const item = prevCart.find(i => i._id === productId);
      if (item && quantity > item.stock) { // Assuming item structure has stock
        toast.error(`Cannot add more. Only ${item.stock} items in stock.`);
        return prevCart;
      }
      return prevCart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};