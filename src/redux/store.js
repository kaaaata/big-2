import { createStore, combineReducers } from 'redux';

const initialState = {
  player: {
    name: '',
  },
  game: {},
  games: [],
};

const reducers = {
  default: (state = initialState, action) => {
    switch (action.type) {
      case 'set_player':
        return { ...state, 
          player: action.payload,
        };
      case 'set_game':
        return { ...state, 
          game: action.payload,
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
