import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1; // Incrementa a quantidade existente por 1
      } else {
        state.push({ ...action.payload, quantity: 1 }); // Adiciona novo item com quantidade inicial 1
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const item = state.find((item) => item.id === action.payload.id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },
    clearCart: () => [],
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
