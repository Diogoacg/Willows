import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1, cartKey: `${action.payload.id}_${Date.now()}` });
      }
    },
    addToCartWithDetails: (state, action) => {
      // Always appends a new entry (supports multiple entries for same item with different observacoes)
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
    clearCart: () => [],
  },
});

export const { addToCart, addToCartWithDetails, incrementQuantity, decrementQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
