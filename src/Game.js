import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as server from './httpClient';
import { Button } from 'reactstrap';

import Big2Client from './Big2Client';
import './styles/Game.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  game: state.default.game,
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  setGame: (game) => dispatch(actions.setGame(game)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Game extends Component {
  constructor() {
    super();
    this.state = {
      interval: null,
      p1Wins: 0,
      p2Wins: 0,
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
    const { player, setGame } = this.props;
    // const { game, games } = this.props creates a strange bug where { game, games } does not reflect updates in redux store.

    // keep the game alive
    this.setState({ interval: setInterval(async() => {
      await server.post(`stayAlive/${player.id}`);
      setGame(this.props.games.filter(item => item.id === this.props.game.id)[0]);
    }, 1000) });

    // start a game when a new player joins the P2 slot
    while (true) {
      await this.wait(1000);
      const game = (await server.get('allGames')).filter(item => item.id === this.props.game.id)[0];

      if (game && game.players.length === 2) {
        setGame(game);
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
    let lastInstruction = (await server.get(`fetchInstruction/${game.id}`)).instruction;
    let lastInstruction_id = client.spectating
      ? lastInstruction
        ? lastInstruction.id
        : null
      : null;
    while (true) {
      // server ping tick frequency
      await this.wait(50);
      // pull down instruction from server
      const output = await server.get(`fetchInstruction/${game.id}`);
      instruction = output.instruction;
      // if instruction hasn't been already processed, process it
      if (instruction && (instruction.id !== lastInstruction_id || !lastInstruction_id)) {
        console.log(instruction.action);
        // if a player wins, do this...
        if (instruction.action === 'p1Wins' || instruction.action === 'p2Wins') {
          // put something here to determine whether a new game should be booted up
          if (instruction.action === 'p1Wins') {
            this.setState({ p1Wins: this.state.p1Wins + 1 });
          } else {
            this.setState({ p2Wins: this.state.p2Wins + 1 });
          }
          await this.wait(2000);
          const newCards = await client.newInstruction('newGame');
          client.initDeckPropertiesAndMount();
          client.initGame(newCards.p1Hand, newCards.p2Hand, newCards.table, newCards.activeCards);
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
    const { p1Wins, p2Wins } = this.state;
    const { game, player, players } = this.props;
    const opponent = players[1]
      ? (players[1].id === player.id ? players[0].name : players[1].name)
      : null;
    const spectating = player.id !== game.players[0].id && player.id !== game.players[1].id;
    
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
            {game.players[0].name} vs. {game.players[1] ? game.players[1].name : '...'}
          </article>
          <article className="blank">
            {/* for flexbox justify-content: space-between */}
          </article>
        </section>

        <article className="player top">{opponent || 'waiting for player...'} ({p2Wins} wins)</article>
        <article className="client">
          <div id="container" style={{
            background: game.turn === 'p1'
              ? player.id === game.players[0].id || spectating
                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 0, 0.4))'
                : 'linear-gradient(to top, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 0, 0.4))'
              : player.id === game.players[0].id || spectating
                ? 'linear-gradient(to top, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 0, 0.4))'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 0, 0.4))'
          }} />
        </article>
        <article className="player bottom">{player.name} ({p1Wins} wins)</article>
      </section>
    );
  }
});
