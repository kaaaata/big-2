import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as functions from './functions';
import shortid from 'shortid';
import { Button, Form, FormGroup, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import './styles/Home.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  game: state.default.game,
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  setPlayer: (name) => dispatch(actions.setPlayer(name)),
  setGame: (game) => dispatch(actions.setGame(game)),
  syncGames: (games) => dispatch(actions.syncGames(games)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Home extends Component {
  constructor() {
    super();
    this.state = {
      gameDropdownOpen: false,
      redirect: false,
      interval: null,
    };
  }

  async newGame() {
    const { player, syncGames, setGame } = this.props;
    if (player.name === '') return alert('Please enter your name.');
    const newGame = {
      id: shortid.generate(),
      player,
    };
    const game = await functions.post('newGame', newGame);

    setGame(game);
    syncGames(await functions.get('allGames'));
    this.setState({ redirect: true });
  }

  async joinGame(game_id) {
    const { setGame, player, syncGames } = this.props;
    const gameInfo = {
      game_id,
      player,
    };
    const game = await functions.post('joinGame', gameInfo);

    setGame(game);
    syncGames(await functions.get('allGames'));
    this.setState({ redirect: true });
  }

  async componentDidMount() {
    const { setPlayer, syncGames } = this.props;
    const newPlayer = {
      id: shortid.generate(),
      name: 'Cat',
    };
    
    setPlayer(newPlayer);
    syncGames(await functions.get('allGames'));
    this.setState({ interval: setInterval(async() => {
      syncGames(await functions.get('allGames'));
    }, 1000) });
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  render() {
    const { gameDropdownOpen, redirect } = this.state;
    const { player, games, game, setPlayer } = this.props;

    return (
      <section className="home">
        <article className="title">
          Cat's Big 2
        </article>
        <article className="player">
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <Input
                value={player.name}
                onChange={(e) => setPlayer({ id: player.id, name: e.target.value })}
                placeholder="Your name"
              />
            </FormGroup>
          </Form>
        </article>
        <article className="games">
          <Dropdown
            isOpen={gameDropdownOpen}
            toggle={() => this.setState({ gameDropdownOpen: !gameDropdownOpen })}
            inNavbar
          >
            <DropdownToggle color="success" caret>
              Join Game
            </DropdownToggle>
            <DropdownMenu className="games-dropdown" right>
              {games.map(game => (
                <DropdownItem key={game.id} onClick={() => this.joinGame(game.id)}>
                  {game.players[0].name}'s Game
                </DropdownItem>  
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="danger"
            onClick={() => this.newGame()}
          >
            {redirect &&
              <Redirect to={`/game/${game.id}`} />
            }
            New Game
          </Button>
        </article>
      </section>
    );
  }
});
