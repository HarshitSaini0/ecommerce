import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import productsServices from '../appwrite/product.js';
import cartServices from '../appwrite/cart.js';
import { addProductToCart, setCart } from '../store/cartSlice';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userData = useSelector((state) => state.auth.userData);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsServices.getAllProducts();
        setProducts(response.documents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (userData?.$id) {
        try {
          const response = await cartServices.getCart(userData.$id);
          if (response) {
            dispatch(setCart({
              cartId: response.$id,
              userId: response.userId,
              products: response.products || [],
              productsQuantity: response.productsQuantity || [],
              totalAmount: response.totalAmount || 0
            }));
          }
        } catch (err) {
          console.error("Failed to fetch cart:", err);
        }
      }
    };

    fetchCart();
  }, [userData, dispatch]);

  const handleAddToCart = async (productId) => {
    if (!userData?.$id) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      // Create a new cart object with updated products
      const updatedProducts = [...(cart.products || [])];
      const updatedQuantities = [...(cart.productsQuantity || [])];
      
      const existingIndex = updatedProducts.indexOf(productId);
      
      if (existingIndex === -1) {
        updatedProducts.push(productId);
        updatedQuantities.push(1);
      } else {
        updatedQuantities[existingIndex] += 1;
      }

      // Update cart in backend
      await cartServices.updateCart(userData.$id, {
        products: updatedProducts,
        productsQuantity: updatedQuantities,
        totalAmount: cart.totalAmount
      });

      // Update Redux store
      dispatch(setCart({
        ...cart,
        products: updatedProducts,
        productsQuantity: updatedQuantities
      }));

    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <div key={product.$id} className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          {product.images?.length > 0 && (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-48 object-cover my-2"
            />
          )}
          <p className="text-lg">${product.price}</p>
          <button 
            onClick={() => handleAddToCart(product.$id)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;