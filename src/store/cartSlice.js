import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';

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
      saveCartToCookies(state);
    },
    removeProductFromCart(state, action) {
      state.products = state.products.filter((p, i) => {
        if (p === action.payload) {
          state.productsQuantity[i] -= 1;
          if (state.productsQuantity[i] <= 0) {
            state.productsQuantity.splice(i, 1);
            return false;
          }
        }
        return true;
      });
      saveCartToCookies(state);
    },
    clearCart(state) {
      state.cartId = null;
      state.userId = null;
      state.products = [];
      state.productsQuantity = [];
      state.totalAmount = 0;
      Cookies.remove(CART_COOKIE_NAME);
    },
  },
});

export const { setCart, addProductToCart, removeProductFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;