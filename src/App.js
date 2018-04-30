import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
// import * as actions from './redux/actions';
// import store from './redux/store';

import Home from './Home';
import Game from './Game';
import './styles/App.css';

const mapStateToProps = (state) => ({
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  //
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(class App extends Component {
  render() {
    const { games } = this.props;

    return (
      <main className="app">
        <Switch>
          <Route
            exact path="/"
            render={() => <Home />}
          />
          {games.map((game, index) => (
            <Route
              key={index}
              exact path={`/game/${game.id}`}
              render={() => <Game {...game} />}
            />
          ))}
        </Switch>
      </main>
    );
  }
}));
