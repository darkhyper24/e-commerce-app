import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize with empty cart
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState({ show: false, product: null });
  
  // Get user from AuthContext
  const { user } = useAuth();

  // Helper functions for cart API interactions
  const fetchServerCart = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('/api/cart', {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart from server:', error);
    }
  };
  
  // Sync local cart to server after login
  const syncLocalCartToServer = async (localCart) => {
    if (!user || !localCart.length) return;
    
    try {
      // First fetch existing cart items to avoid duplication
      const response = await axios.get('/api/cart', {
        withCredentials: true
      });
      
      const serverCart = response.data.success ? response.data.data : [];
      const serverProductIds = new Set(serverCart.map(item => item.id));
      
      // Filter local cart to only include items not already in server cart
      const newItems = localCart.filter(item => !serverProductIds.has(item.id));
      
      // For items in both carts, we'll update quantities instead of adding duplicates
      const existingItems = localCart.filter(item => serverProductIds.has(item.id));
      
      // Add new items
      if (newItems.length > 0) {
        await Promise.all(newItems.map(item => 
          axios.post('/api/cart/add', {
            productId: item.id,
            quantity: item.quantity
          }, {
            withCredentials: true
          })
        ));
      }
      
      // Update quantities for existing items
      if (existingItems.length > 0) {
        await Promise.all(existingItems.map(localItem => {
          const serverItem = serverCart.find(s => s.id === localItem.id);
          // Only update if local quantity is higher than server quantity
          if (localItem.quantity > serverItem.quantity) {
            return axios.put('/api/cart/update', {
              productId: localItem.id,
              quantity: localItem.quantity
            }, {
              withCredentials: true
            });
          }
          return Promise.resolve(); // No update needed
        }));
      }
      
      // After syncing, fetch the updated cart from server
      await fetchServerCart();
    } catch (error) {
      console.error('Failed to sync local cart to server:', error);
    }
  };
  
  // Sync cart when user changes
  useEffect(() => {
    if (user) {
      const localCart = [...cart]; // Create a copy to avoid mutation issues
      if (localCart.length > 0) {
        syncLocalCartToServer(localCart);
      } else {
        fetchServerCart();
      }
    }
    // Don't clear the cart when logging out anymore
    // That way items persist until login
  }, [user]);
  
  // Calculate cart total whenever cart changes
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);
  
  // Add product to cart
  const addToCart = async (product) => {
    setCart(prevItems => {
      // Check if product already exists in cart
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if product already in cart, but don't exceed max stock
        return prevItems.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: Math.min(item.quantity + 1, product.quantity),
                maxStock: product.quantity // Ensure maxStock is always updated
              } 
            : item
        );
      } else {
        // Add new product with quantity 1 and track maxStock
        return [...prevItems, { 
          ...product, 
          quantity: 1,
          maxStock: product.quantity // Store the max available stock
        }];
      }
    });
    
    // If user is logged in, update server
    if (user) {
      try {
        await axios.post('/api/cart/add', {
          productId: product.id,
          quantity: 1
        }, {
          withCredentials: true
        });
      } catch (err) {
        console.error('Failed to update server cart:', err);
      }
    }
    
    // Show notification
    setNotification({ show: true, product });
    setTimeout(() => {
      setNotification({ show: false, product: null });
    }, 3000);
  };
  
  // Remove product from cart
  const removeFromCart = async (productId) => {
    // Update local state immediately
    setCart(prevItems => prevItems.filter(item => item.id !== productId));
    
    // If user is logged in, update server
    if (user) {
      try {
        await axios.delete(`/api/cart/remove/${productId}`, {
          withCredentials: true
        });
      } catch (err) {
        console.error('Failed to remove item from server cart:', err);
        // Optionally revert the local change if server update fails
        // fetchServerCart();
      }
    }
  };
  
  // Update product quantity in cart
  const updateQuantity = async (productId, quantity, maxStock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Update local state immediately
    setCart(prevItems => {
      const item = prevItems.find(i => i.id === productId);
      if (!item) return prevItems;
      
      // Use the item's maxStock if available, otherwise use the passed maxStock
      const effectiveMaxStock = item.maxStock || maxStock;
      
      // Don't allow quantity to exceed max stock
      const safeQuantity = effectiveMaxStock !== undefined ? 
        Math.min(quantity, effectiveMaxStock) : 
        quantity;
      
      return prevItems.map(i => 
        i.id === productId ? { ...i, quantity: safeQuantity } : i
      );
    });
    
    // If user is logged in, update server
    if (user) {
      try {
        await axios.put('/api/cart/update', {
          productId,
          quantity
        }, {
          withCredentials: true
        });
      } catch (err) {
        console.error('Failed to update item quantity on server:', err);
        // Optionally revert the local change if server update fails
        // fetchServerCart();
      }
    }
  };
  
  // Get total number of items in cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  const value = {
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    notification
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};