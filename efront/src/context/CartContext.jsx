import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify"; // ✅ Import toast

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  };

  const [cartItems, setCartItems] = useState(loadCart());

  // Effect to sync cart state with localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    // --- STOCK CHECKING LOGIC ---
    if (product.stock <= 0) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }

    const exist = cartItems.find((item) => item._id === product._id);
    let showSuccessToast = true;

    if (exist) {
      // Check if adding more exceeds stock
      if (exist.qty + qty > product.stock) {
        toast.warn(
          `You can only add ${product.stock} of this item to your cart.`
        );
        showSuccessToast = false;
        // Set to max stock
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === product._id ? { ...item, qty: product.stock } : item
          )
        );
      } else {
        // If not, just update quantity
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === product._id ? { ...item, qty: item.qty + qty } : item
          )
        );
      }
    } else {
      // New item, check quantity against stock
      if (qty > product.stock) {
        toast.warn(
          `You can only add ${product.stock} of this item to your cart.`
        );
        showSuccessToast = false;
        // Add with max stock
        setCartItems((prevItems) => [
          ...prevItems,
          { ...product, qty: product.stock },
        ]);
      } else {
        // Add new item with specified quantity
        setCartItems((prevItems) => [...prevItems, { ...product, qty: qty }]);
      }
    }

    // Only show success if no stock error was shown
    if (showSuccessToast) {
      toast.success("Product added to cart!");
    }
  };

  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        // --- STOCK CHECK ---
        if (item._id === productId) {
          if (item.qty + 1 > item.stock) {
            toast.warn(`Maximum stock (${item.stock}) reached.`);
            return item; // Return item unchanged
          }
          return { ...item, qty: item.qty + 1 }; // OK to increase
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          // Decrement if qty > 1
          item._id === productId && item.qty > 1
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        // Filter ensures items with qty 0 (if logic allowed) are removed,
        // though our decrement stops at 1.
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      toast.info("Item removed from cart.");
      return prevItems.filter((item) => item._id !== productId);
    });
  };

  // Function to clear cart contents entirely
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart, // Export clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
