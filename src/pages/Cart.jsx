import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCart, clearCart ,removeProductFromCart,addProductToCart,calculateAndUpdateTotal } from '../store/cartSlice';
import cartServices from '../appwrite/cart.js';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userId = useSelector((state) => state.auth.userData?.$id); // Assuming you have auth state

  // Fetch cart data when component mounts or userId changes
  useEffect(() => {
    const fetchCart = async () => {
      if (userId) {
        try {
          cartServices.getCart(userId).then((response) => {
            const cartData = response || null;
            if (cartData) {
              dispatch(setCart(cartData));
            } else {
              dispatch(clearCart());
            }

         
        } ).catch((error) => {
          console.error('Error fetching cart:', error);
          dispatch(clearCart());
          });
      }
      catch (error) {
        console.error('Error fetching cart:', error);
        dispatch(clearCart());
      }
      }
    };

    fetchCart();
  }, [dispatch, userId]);

  // Handle quantity changes
  const handleAddToCart = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const productIndex = cart.products.findIndex(p => p === productId);
    if (productIndex === -1) return;

    const updatedQuantities = [...cart.productsQuantity];
    updatedQuantities[productIndex] = newQuantity;

    try {
      await cartServices.updateCart(userId, {
        productIds: cart.products,
        quantities: updatedQuantities,
      });

      // Update local state
      dispatch(addProductToCart(
        productId
      ));
      dispatch(calculateAndUpdateTotal())
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    const productIndex = cart.products.findIndex(p => p === productId);
    if (productIndex === -1) return;

    const updatedProducts = cart.products.filter((_, index) => index !== productIndex);
    const updatedQuantities = cart.productsQuantity.filter((_, index) => index !== productIndex);

    try {
      await cartServices.updateCart(userId, {
        productIds: updatedProducts,
        quantities: updatedQuantities,// Will be recalculated in service
      });

      // Update local state
      dispatch(removeProductFromCart(productId));
      dispatch(calculateAndUpdateTotal())
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await cartServices.deleteCart(cart.cartId);
      dispatch(clearCart());
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Please <Link to="/login" className="text-blue-500">login</Link> to view your cart.</p>
      </div>
    );
  }

  if (!cart.products.length) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Your cart is empty. <Link to="/products" className="text-blue-500">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      
      <div className="grid gap-4">
        {cart.products.map((productId, index) => (
          <div key={productId} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Product ID: {productId}</h3>
              {/* You might want to fetch and display product details here */}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <button 
                  onClick={() => handleRemoveItem(productId, cart.productsQuantity[index] - 1)}
                  className="px-2 py-1 bg-gray-200 rounded-l"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">
                  {cart.productsQuantity[index]}
                </span>
                <button 
                  onClick={() => handleAddToCart(productId, cart.productsQuantity[index] + 1)}
                  className="px-2 py-1 bg-gray-200 rounded-r"
                >
                  +
                </button>
              </div>
              
              
                
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 border-t">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Total: Rs. {cart.totalAmount}</h2>
          <div className="space-x-2">
            <button 
              onClick={handleClearCart}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Clear Cart
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;