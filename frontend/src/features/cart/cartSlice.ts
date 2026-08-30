import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, PizzaOption } from '../../types';

const initialState: CartState = {
  base: null,
  sauce: null,
  cheese: null,
  vegetables: [],
  currentStep: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setBase: (state, action: PayloadAction<PizzaOption>) => {
      state.base = action.payload;
    },
    setSauce: (state, action: PayloadAction<PizzaOption>) => {
      state.sauce = action.payload;
    },
    setCheese: (state, action: PayloadAction<PizzaOption>) => {
      state.cheese = action.payload;
    },
    addVegetable: (state, action: PayloadAction<PizzaOption>) => {
      const exists = state.vegetables.find((v: PizzaOption) => v.name === action.payload.name);
      if (!exists) {
        state.vegetables.push(action.payload);
      }
    },
    removeVegetable: (state, action: PayloadAction<string>) => {
      state.vegetables = state.vegetables.filter((v: PizzaOption) => v.name !== action.payload);
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, 3);
    },
    previousStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 0);
    },
    clearCart: (state) => {
      state.base = null;
      state.sauce = null;
      state.cheese = null;
      state.vegetables = [];
      state.currentStep = 0;
    },
  },
});

export const {
  setBase,
  setSauce,
  setCheese,
  addVegetable,
  removeVegetable,
  setStep,
  nextStep,
  previousStep,
  clearCart,
} = cartSlice.actions;

export const selectCartTotal = (state: { cart: CartState }) => {
  const { base, sauce, cheese, vegetables } = state.cart;
  let total = 0;
  if (base) total += base.price;
  if (sauce) total += sauce.price;
  if (cheese) total += cheese.price;
  vegetables.forEach((v) => (total += v.price));
  return total;
};

export default cartSlice.reducer;
