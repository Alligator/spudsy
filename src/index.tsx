import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { createStore, Store } from 'redux';
import { StoreState, reducer, initialState } from './state';
import { Provider } from 'react-redux';
import { loadGame, saveGame } from './persist';

let store: Store<StoreState>;
const state = loadGame();

if (state) {
  store = createStore(
    reducer,
    state,
    // tslint:disable-next-line:no-any
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  );
} else {
  store = createStore(
    reducer,
    // tslint:disable-next-line:no-any
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  );
}

let saveTimeout: number | null = null;
store.subscribe(() => {
  // Save if the user hasn't done anything for 2 seconds
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = window.setTimeout(() => saveGame(store.getState()), 2000);
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
