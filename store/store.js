import {configureStore} from '@reduxjs/toolkit';
import outletReducer from './slice/OutletSlice';

export const store = configureStore({
  reducer: {
    outlet: outletReducer,
  },
});
