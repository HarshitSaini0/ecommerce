import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartId: null,
  userId: null,
  products: [],
  productsQuantity: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      state = action.payload;
    },
    addProductToCart(state, action) {
      let index = -1;
      const existingProduct = state.products.find((p, i) => {
        index = i;
        return p === action.payload;
      });
      if (!existingProduct) {
        action.payload.productsQuantity[index] = 1;
        state.products.push(action.payload);
      } else {
        state.productsQuantity[index] += 1;
      }
    },
    removeProductFromCart(state, action) {
      state.products = state.products.filter((p, i) => {
        if (p === action.payload) {
          state.productsQuantity[i] -= 1;
          if (state.productsQuantity[i] === 0 || state.productsQuantity[i] < 0) {
            state.productsQuantity.splice(i, 1);
            return false;
          }
        }
      });
    },
    clearCart(state) {
      state.cartId = null;
      state.userId = null;
      state.products = [];
      state.productsQuantity = [];
      state.totalAmount = 0;
    },
  },
});

export const { setCart, addProductToCart, removeProductFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
