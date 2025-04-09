import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import productServices from '../appwrite/product';
import cartService from '../appwrite/cart';
import { setCart } from '../store/cartSlice';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userData = useSelector(state => state.auth.userData);
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
       productServices.getAllProducts().then((response) => {
          if (response) {
            setProducts(response);
            
          }
        }).catch((error) => {
          console.error("Error fetching products:", error);
          setError("Failed to fetch products. Please try again later.");
        });
     
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch user's cart when user data changes
  useEffect(() => {
    const fetchCart = async () => {
      if (userData?.$id) {
        try {
         cartService.getCart(userData.$id).then((response) => {
         
          const cartData = response || null;
          console.log("Fetched cart data:", cartData);
          
          dispatch(setCart(cartData));
          setCart(cartData);
          console.log('this is a cart ',cart);
          
          
          }).catch((error) => {
            console.error("Error fetching cart:", error);
            setError("Failed to fetch cart. Please try again later.");
            });
         }
          
         catch (error) {
          console.error("Failed to fetch cart:", error);
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
      // Get current cart or initialize empty one
      const currentCart = cart;
      console.log("Current cart:", currentCart);
      console.log(" cart:", cart);
      
      // Find product index

      console.log(productId);
      console.log(currentCart.products);
      console.log(currentCart.productsQuantity);
      
      const productIndex = currentCart.products.indexOf(productId);
      const updatedProductIds = [...currentCart.products];
      const updatedQuantities = [...currentCart.productsQuantity];

      if (productIndex === -1) {
        // New product
        updatedProductIds.push(productId);
        updatedQuantities.push(1);
        console.log("Updated product IDs push:", updatedProductIds);
        console.log("Updated quantities push:", updatedQuantities);
      } else {
        // Existing product - increment quantity
        updatedQuantities[productIndex] += 1;
        console.log("Updated product IDs:", updatedProductIds);
        console.log("Updated quantities:", updatedQuantities);
      }
     
      

      // Update cart in backend

      cartService.updateCart(userData.$id, {
        productIds: updatedProductIds,
        quantities: updatedQuantities
      }).then((response) => {
        if (response) {
          console.log("Cart updated successfully:", response);
        }
        const updatedCart = response || null;
        console.log("Updated cart data:", updatedCart);
        dispatch(setCart(updatedCart));
      }).catch((error) => {
        console.error("Error updating cart:", error);
        });
      // const updatedCart = await cartService.updateCart(userData.$id, {
      //   productIds: updatedProductIds,
      //   quantities: updatedQuantities
      // });

      // Update Redux store
      // dispatch(setCart({
      //   ...updatedCart,
      //   products: updatedProductIds,npm
      //   productsQuantity: updatedQuantities,
      //   total: updatedCart.total
      // }));

    } catch (error) {
      console.error("Cart update error:", error);
      alert(`Failed to update cart: ${error.message}`);
    }
  };

  const getProductQuantity = (productId) => {
    const index = cart?.productIds?.indexOf(productId) ?? -1;
    return index !== -1 ? cart.quantities[index] : 0;
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Products</h1>
        <Link 
          to="/cart" 
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <span className="mr-2">View Cart</span>
          {cart?.productIds?.length > 0 && (
            <span className="bg-white text-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
              {cart.productIds.length}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.$id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden">
              {product.images?.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">${product.price}</span>
                <div className="flex items-center">
                  {getProductQuantity(product.$id) > 0 && (
                    <span className="mr-2 text-sm">
                      ({getProductQuantity(product.$id)} in cart)
                    </span>
                  )}
                  <button
                    onClick={() => handleAddToCart(product.$id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;