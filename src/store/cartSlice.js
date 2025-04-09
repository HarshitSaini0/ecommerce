import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';
import productServices from '../appwrite/product.js';

// Helper functions for cookie management
const CART_COOKIE_NAME = 'cartData';

const getCartFromCookies = () => {
  const cookieData = Cookies.get(CART_COOKIE_NAME);
  return cookieData ? JSON.parse(cookieData) : {
    cartId: null,
    userId: null,
    products: [],
    productsQuantity: [],
    totalAmount: 0,
    loading: false,
    error: null
  };
};

const saveCartToCookies = (cartData) => {
  Cookies.set(CART_COOKIE_NAME, JSON.stringify(cartData), {
    expires: 7, // Expires in 7 days
    secure: true,
    sameSite: 'strict'
  });
};

const initialState = getCartFromCookies();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      state.cartId = action.payload.$id;
      state.userId = action.payload.userId;
      state.products = action.payload.productsId || [];
      state.productsQuantity = action.payload.productQuantity || [];
      state.totalAmount = action.payload.totalAmount || 0;
      state.loading = false;
      state.error = null;
      saveCartToCookies(state);
    },
    addProductToCart(state, action) {
      let index = -1;
      const existingProduct = state.products.find((p, i) => {
        index = i;
        return p === action.payload;
      });
      
      if (!existingProduct) {
        state.productsQuantity.push(1);
        state.products.push(action.payload);
      } else {
        state.productsQuantity[index] += 1;
      }
      state.loading = true; // Set loading state while fetching prices
      saveCartToCookies(state);
    },
    removeProductFromCart(state, action) {
      const newProducts = [];
      const newQuantities = [];
      
      state.products.forEach((p, i) => {
        if (p === action.payload) {
          if (state.productsQuantity[i] > 1) {
            newProducts.push(p);
            newQuantities.push(state.productsQuantity[i] - 1);
          }
        } else {
          newProducts.push(p);
          newQuantities.push(state.productsQuantity[i]);
        }
      });
      
      state.products = newProducts;
      state.productsQuantity = newQuantities;
      state.loading = true; // Set loading state while fetching prices
      saveCartToCookies(state);
    },
    clearCart(state) {
      state.cartId = null;
      state.userId = null;
      state.products = [];
      state.productsQuantity = [];
      state.totalAmount = 0;
      state.loading = false;
      state.error = null;
      Cookies.remove(CART_COOKIE_NAME);
    },
    updateTotalAmount(state, action) {
      state.totalAmount = action.payload;
      state.loading = false;
      saveCartToCookies(state);
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
      saveCartToCookies(state);
    }
  },
});

// Thunk action to calculate total amount asynchronously
export const calculateAndUpdateTotal = () => async (dispatch, getState) => {
  const { products, productsQuantity } = getState().cart;
  
  if (products.length === 0) {
    dispatch(updateTotalAmount(0));
    return;
  }

  try {
    // First get the array of price promises
    const pricePromises = await productServices.getProductsPrice(products);
    
    // Wait for all promises to resolve
    const productPrices = await Promise.all(pricePromises);
    console.log(productPrices);
    console.log(pricePromises);
    
    
    // Now calculate with actual prices
    const total = products.reduce((sum, _, index) => {
      return sum + (productPrices[index] * productsQuantity[index]);
    }, 0);
    
    dispatch(updateTotalAmount(total));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Export the regular actions
export const { 
  setCart, 
  addProductToCart, 
  removeProductFromCart, 
  clearCart,
  updateTotalAmount,
  setError
} = cartSlice.actions;

export default cartSlice.reducer;