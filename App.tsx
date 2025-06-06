import React from 'react';
import AppNavigation from './Source/Navigation/AppNavigation';
import { Provider } from 'react-redux';
import { store } from './store/store';


export default function App() {
  return (
    <Provider store={store}>
      <AppNavigation />

    </Provider>
  );
};
