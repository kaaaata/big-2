import { createStore, combineReducers } from 'redux';
import * as functions from '../functions';

const initialState = {
  player: '',
  games: [1, 2, 3],
};

const reducers = {
  default: (state = initialState, action) => {
    switch (action.type) {
      case 'set_player_name':
        return { ...state, 
          player: action.payload,
        };
      case 'sync_games':
        return { ...state, 
          games: action.payload,
        };
      default:
        return state;
    }
  },
};

export default createStore(combineReducers(reducers));
