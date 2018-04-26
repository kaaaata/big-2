import { createStore, combineReducers } from 'redux';
import * as functions from '../functions';
import shortid from 'shortid';

const initialState = {
  //
};

const reducers = {
  default: (state = initialState, action) => {
    switch (action.type) {
      case 'add_day':
        return { ...state, 
          //
        };
      default:
        return state;
    }
  },
};

export default createStore(combineReducers(reducers));
