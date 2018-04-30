import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as functions from './functions';

import Big2Client from './Big2Client';
import './styles/Game.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  game: state.default.game,
});
const mapDispatchToProps = (dispatch) => ({
  syncGames: (games) => dispatch(actions.syncGames(games)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Game extends Component {
  constructor() {
    super();
    this.state = {
      interval: null,
    };
  }

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async componentDidMount() {
    const { players, player, game, syncGames } = this.props;
    let client = new Big2Client(document.getElementById('container'), game, player.id);

    this.setState({ interval: setInterval(async() => {
      await functions.post('stayAlive', player.id);
      await functions.post('stayAlive', 'dummy id'); // keep the dummy player alive for development
      syncGames(await functions.get('allGames'));
    }, 5000) });

    let instruction = null; // receive the latest instruction from server in this variable
    let lastInstruction_id = null; // keep track of the last instruction processed
    while (true) {
      // wait 1 second
      await this.wait(1000);
      // pull down instruction from server
      instruction = await functions.get('fetchInstruction', game.id);
      // if instruction hasn't been already processed, process it
      if (instruction && (instruction.id !== lastInstruction_id || !lastInstruction_id)) {
        console.log(instruction.action);
        // if a player wins, do this...
        if (instruction.action === 'p1 wins' || instruction.action === 'p2 wins') {
          // put something here to determine whether a new game should be booted up
        }
        // read the instruction to the client
        client.readInstruction(instruction);
        // keep track of the last instruction processed, to avoid processing the same instruction twice
        lastInstruction_id = instruction.id;
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  render() {
    const { players } = this.props;
    
    return (
      <section className="game">
        <article className="players">
          <p>Player 1: {players[0].name}</p>
          <p>Player 2: {players[1] ? players[1].name : 'waiting...'}</p>
        </article>
        <article className="client">
          <link rel="stylesheet" href="example.css" />
          <div id="container"></div>
        </article>
      </section>
    );
  }
});
