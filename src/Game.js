import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as django from './serverWrappers';

import Big2Client from './Big2Client';
import './styles/Game.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  game: state.default.game,
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  syncGames: (games) => dispatch(actions.syncGames(games)),
  setGame: (game) => dispatch(actions.setGame(game)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Game extends Component {
  constructor() {
    super();
    this.state = {
      interval: null,
      p1_wins: 0,
      p2_wins: 0,
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
    const { player, syncGames, setGame } = this.props;
    // const { game, games } = this.props creates a strange bug where { game, games } does not reflect updates in redux store.

    // keep the game alive
    this.setState({ interval: setInterval(async() => {
      await django.post('stayAlive', player.id);
      await django.post('stayAlive', 'dummy id'); // keep the dummy player alive for development
      syncGames(await django.get('allGames'));
      setGame(this.props.games.filter(item => item.id === this.props.game.id)[0]);
    }, 1000) });

    // start a game when a new player joins the P2 slot
    while (true) {
      await this.wait(1000);
      if (this.props.game.players.length === 2) {
        this.newGame();
        break;
      }
    }
  }

  async newGame() {
    const { player, game } = this.props;
    let client = new Big2Client(document.getElementById('container'), game, player.id);

    let instruction = null; // receive the latest instruction from server in this variable
    let lastInstruction_id = null; // keep track of the last instruction processed
    while (true) {
      // server ping tick frequency
      await this.wait(100);
      // pull down instruction from server
      instruction = await django.get('fetchInstruction', { game_id: game.id });
      // if instruction hasn't been already processed, process it
      if (instruction && (instruction.id !== lastInstruction_id || !lastInstruction_id)) {
        console.log(instruction.action);
        // if a player wins, do this...
        if (instruction.action === 'p1 wins' || instruction.action === 'p2 wins') {
          // put something here to determine whether a new game should be booted up
          if (instruction.action === 'p1 wins') {
            this.setState({ p1_wins: this.state.p1_wins + 1 });
          } else {
            this.setState({ p2_wins: this.state.p2_wins + 1 });
          }
          await client.newInstruction('new game');
          await this.wait(1000);
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
    const { p1_wins, p2_wins } = this.state;
    const { player, players } = this.props;
    const opponent = players[1]
      ? (players[1].id === player.id ? players[0].name : players[1].name)
      : null;
    
    return (
      <section className="game">
        <article className="title">Big 2</article>
        <article className="player top">{opponent || 'waiting for player...'} ({p2_wins} wins)</article>
        <article className="client">
          <link rel="stylesheet" href="example.css" />
          <div id="container"></div>
        </article>
        <article className="player bottom">{player.name} ({p1_wins} wins)</article>
      </section>
    );
  }
});
