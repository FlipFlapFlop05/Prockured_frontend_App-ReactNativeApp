import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  selectedOutlet: null,
  allOutlets: [],
};

const outletSlice = createSlice({
  name: 'outlet',
  initialState,
  reducers: {
    setSelectedOutlet: (state, action) => {
      state.selectedOutlet = action.payload;
    },
    setAllOutlets: (state, action) => {
      state.allOutlets = action.payload;
    },
    clearOutletData: state => {
      state.selectedOutlet = null;
      state.allOutlets = [];
    },
  },
});

export const {setSelectedOutlet, setAllOutlets, clearOutletData} =
  outletSlice.actions;
export default outletSlice.reducer;
