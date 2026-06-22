import { createSlice } from '@reduxjs/toolkit'

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: { total: 0, status: 'idle' },
  reducers: {
    setTotal: (state, action) => {
      state.total = action.payload
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
  },
})

export const { setTotal, setStatus } = checkoutSlice.actions
export default checkoutSlice.reducer
