import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
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
    const { games, player, syncGames, setGame } = this.props;
    const newGame = {
      id: shortid.generate(),
      name: '',
      player,
    };

    if (player.name === '') return alert('Please enter your name.');
    while (newGame.name === '') {
      newGame.name = prompt('Please enter a name for your game: ');
    }
    if (!newGame.name) return;
    const game = await functions.post('newGame', newGame);
    setGame(game);
    syncGames(await functions.post('allGames'));
    this.setState({ redirect: true });
  }

  async componentDidMount() {
    const { player, setPlayer, syncGames } = this.props;
    const newPlayer = {
      id: shortid.generate(),
      name: '',
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
    const { player, games, game, setPlayer, setGame } = this.props;

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
                <Link
                  key={game.id}
                  className="link"
                  to={`/game/${game.id}`}>
                  <DropdownItem onClick={() => setGame(game)}>{game.name}</DropdownItem>  
                </Link>
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
