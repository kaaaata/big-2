import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as django from './httpClient';
import { Button } from 'reactstrap';

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
    const { player, game, setGame } = this.props;
    let client = new Big2Client(document.getElementById('container'), game, player.id);

    let instruction = null; // receive the latest instruction from server in this variable
    // keep track of the last instruction processed, to avoid processing it twice
    let lastInstruction = (await django.get('fetchInstruction', { game_id: game.id })).instruction;
    let lastInstruction_id = client.spectating
      ? lastInstruction
        ? lastInstruction.id
        : null
      : null;
    while (true) {
      // server ping tick frequency
      await this.wait(100);
      // pull down instruction from server
      const output = await django.get('fetchInstruction', { game_id: game.id });
      instruction = output.instruction;
      // if instruction hasn't been already processed, process it
      if (instruction && (instruction.id !== lastInstruction_id || !lastInstruction_id)) {
        console.log(instruction.action);
        // if a player wins, do this...
        if (instruction.action === 'p1_wins' || instruction.action === 'p2_wins') {
          // put something here to determine whether a new game should be booted up
          if (instruction.action === 'p1_wins') {
            this.setState({ p1_wins: this.state.p1_wins + 1 });
          } else {
            this.setState({ p2_wins: this.state.p2_wins + 1 });
          }
          await this.wait(2000);
          const newCards = await client.newInstruction('new_game');
          client.initDeckPropertiesAndMount();
          client.initGame(newCards.p1_hand, newCards.p2_hand, newCards.table, newCards.active_cards);
          setGame(output.game);
          lastInstruction_id = instruction.id;
        } else {
          // set the game in Redux
          setGame(output.game);
          // read the instruction to the client
          client.readInstruction(instruction);
          // keep track of the last instruction processed, to avoid processing the same instruction twice
          lastInstruction_id = instruction.id;
        }
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  render() {
    const { p1_wins, p2_wins } = this.state;
    const { game, player, players } = this.props;
    const opponent = players[1]
      ? (players[1].id === player.id ? players[0].name : players[1].name)
      : null;
    
    return (
      <section className="game">
        <section className="header">
          <article className="back">
            <Link className="link" to="/">
              <Button
                color="danger"
                onClick={() => clearInterval(this.state.interval)}
              >
                Back
              </Button>
            </Link>
          </article>
          <article className="title">
            {game.players[0].name} vs. {game.players[1].name}
          </article>
          <article>
            {}
          </article>        
        </section>

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
