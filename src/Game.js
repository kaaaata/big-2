import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as functions from './functions';
import './styles/Home.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  setPlayerName: (name) => dispatch(actions.setPlayerName(name)),
  syncGames: (games) => dispatch(actions.syncGames(games)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Game extends Component {
  render() {
    return (
      <section className="game">
        Game Page
      </section>
    );
  }
});
