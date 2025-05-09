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
        state.push({ ...action.payload, quantity: 1 });
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
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remover o item se a quantidade for 1 e o usuário decrementar
          return state.filter((item) => item.id !== action.payload.id);
        }
      }
    },
    clearCart: () => [], // Retorna o estado diretamente vazio ao limpar o carrinho
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
