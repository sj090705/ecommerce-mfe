import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'

const store = configureStore({
  reducer: { cart: cartReducer },
})

window.__productsStore = store

export default store
