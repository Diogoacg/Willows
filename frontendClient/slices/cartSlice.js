import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1, cartKey: `${action.payload.id}_${Date.now()}` });
      }
    },
    addToCartWithDetails: (state, action) => {
      // payload must include cartKey, quantity, observacoes
      state.push(action.payload);
    },
    incrementQuantity: (state, action) => {
      const item = state.find((i) => i.cartKey === action.payload.cartKey);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const index = state.findIndex((i) => i.cartKey === action.payload.cartKey);
      if (index === -1) return;
      if (state[index].quantity <= 1) {
        state.splice(index, 1);
      } else {
        state[index].quantity -= 1;
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((i) => i.cartKey !== action.payload.cartKey);
    },
    clearCart: () => [],
  },
});

export const {
  addToCart,
  addToCartWithDetails,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
