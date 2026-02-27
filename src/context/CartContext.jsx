import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const updateCart = useCallback((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setCount(data.count || 0);
    }, []);

    const fetchCart = useCallback(async () => {
        if (!user) {
            // Load from localStorage for guests
            const localCart = localStorage.getItem('cart');
            if (localCart) {
                try {
                    const data = JSON.parse(localCart);
                    setItems(data.items || []);
                    setTotal(data.total || 0);
                    setCount(data.count || 0);
                } catch (e) {
                    console.error('Error parsing local cart', e);
                }
            }
            return;
        }

        try {
            setLoading(true);
            const data = await cartAPI.get();
            updateCart(data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    }, [user, updateCart]);

    useEffect(() => {
        fetchCart();
    }, [user, fetchCart]);

    // Sync local cart to server on login
    useEffect(() => {
        const syncCart = async () => {
            if (user) {
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                    try {
                        const { items: localItems } = JSON.parse(localCart);
                        if (localItems && localItems.length > 0) {
                            for (const item of localItems) {
                                await cartAPI.add(item.product_id, item.quantity);
                            }
                            localStorage.removeItem('cart');
                            fetchCart();
                        }
                    } catch (e) {
                        console.error('Error syncing cart', e);
                        localStorage.removeItem('cart');
                    }
                }
            }
        };
        syncCart();
    }, [user, fetchCart]);

    const addToCart = async (productId, quantity = 1, productData = null) => {
        if (user) {
            const data = await cartAPI.add(productId, quantity);
            updateCart(data);
            return data;
        } else {
            // Guest cart in localStorage
            let currentItems = [...items];
            const existingIndex = currentItems.findIndex(i => i.product_id === productId);

            if (existingIndex > -1) {
                currentItems[existingIndex].quantity += quantity;
            } else {
                currentItems.push({
                    product_id: productId,
                    quantity,
                    name: productData?.name || 'Producto',
                    price: productData?.price || 0,
                    image_url: productData?.image_url,
                    category_slug: productData?.category_slug,
                    id: `temp-${Date.now()}-${productId}` // Temporary ID for guest
                });
            }

            const newTotal = currentItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const newCount = currentItems.reduce((acc, i) => acc + i.quantity, 0);

            const data = { items: currentItems, total: newTotal, count: newCount };
            setItems(currentItems);
            setTotal(newTotal);
            setCount(newCount);
            localStorage.setItem('cart', JSON.stringify(data));
            return data;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (user) {
            const data = await cartAPI.update(itemId, quantity);
            updateCart(data);
            return data;
        } else {
            let currentItems = items.map(i =>
                i.id === itemId ? { ...i, quantity } : i
            );
            const newTotal = currentItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const newCount = currentItems.reduce((acc, i) => acc + i.quantity, 0);

            const data = { items: currentItems, total: newTotal, count: newCount };
            setItems(currentItems);
            setTotal(newTotal);
            setCount(newCount);
            localStorage.setItem('cart', JSON.stringify(data));
            return data;
        }
    };

    const removeItem = async (itemId) => {
        if (user) {
            const data = await cartAPI.remove(itemId);
            updateCart(data);
            return data;
        } else {
            let currentItems = items.filter(i => i.id !== itemId);
            const newTotal = currentItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const newCount = currentItems.reduce((acc, i) => acc + i.quantity, 0);

            const data = { items: currentItems, total: newTotal, count: newCount };
            setItems(currentItems);
            setTotal(newTotal);
            setCount(newCount);
            localStorage.setItem('cart', JSON.stringify(data));
            return data;
        }
    };

    const clearCart = async () => {
        if (user) {
            const data = await cartAPI.clear();
            updateCart(data);
            return data;
        } else {
            const data = { items: [], total: 0, count: 0 };
            setItems([]);
            setTotal(0);
            setCount(0);
            localStorage.removeItem('cart');
            return data;
        }
    };

    const getItemQuantity = (productId) => {
        const item = items.find(i => i.product_id === productId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider value={{ items, total, count, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart, getItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
