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
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.find((i) => i.id === action.payload.id);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const index = state.findIndex((i) => i.id === action.payload.id);
      if (index === -1) return;
      if (state[index].quantity <= 1) {
        state.splice(index, 1);
      } else {
        state[index].quantity -= 1;
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((i) => i.id !== action.payload.id);
    },
    clearCart: () => [],
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
