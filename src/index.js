import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';

ReactDOM.render(
  <Provider store={store}>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </Provider>,
  document.getElementById('root')
);
