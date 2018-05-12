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
        // set active player
        return { ...state, 
          player: action.payload,
        };
      case 'set_game':
        // set the active game. if game exists, update it, otherwise add it.
        return { ...state, 
          game: action.payload,
          games: state.games.map(game => game.id).includes(action.payload.id)
            ? state.games.map(game => action.payload.id === game.id ? action.payload : game)
            : [...state.games, action.payload],
        };
      case 'sync_games':
        // sync all games with server
        return { ...state, 
          games: action.payload,
        };
      default:
        return state;
    }
  },
};

export default createStore(combineReducers(reducers));
