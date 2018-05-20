import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as django from './httpClient';
import shortid from 'shortid';
import { Button, Form, FormGroup, Label, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

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

  async newGame(button) {
    const { player, setGame } = this.props;
    if (player.name === '') return alert('Please enter your name.');
    let newGame = {};
    if (button === 'New Game') {
      newGame = {
        id: shortid.generate(),
        p1: player,
        p2: null,
      };
    } else if (button === 'Play AI') {
      newGame = {
        id: '1vAI_' + shortid.generate(),
        p1: player,
        p2: { id: shortid.generate(), name: 'Cat-Bot 2000' },
      };
    } else if (button === 'AI vs. AI') {
      newGame = {
        id: 'AIvAI_' + shortid.generate(),
        p1: { id: shortid.generate(), name: 'Cat-Bot 2000' },
        p2: { id: shortid.generate(), name: 'Cat-Bot 2000' },
        spectator: player,
      };
    }
    const game = await django.post('newGame', newGame);

    setGame(game);
    this.setState({ redirect: true });
  }

  async joinGame(game_id) {
    const { setGame, player } = this.props;
    if (player.name === '') return alert('Please enter your name.');
    const gameInfo = {
      game_id,
      player,
    };
    const game = await django.post('joinGame', gameInfo);

    setGame(game);
    this.setState({ redirect: true });
  }

  async componentDidMount() {
    const { setPlayer, syncGames } = this.props;
    const newPlayer = {
      id: shortid.generate(),
      name: 'Cat',
    };
    
    setPlayer(newPlayer);
    syncGames(await django.get('allGames'));
    this.setState({ interval: setInterval(async() => {
      syncGames(await django.get('allGames'));
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
          <h1>Big 2</h1>
        </article>
        <article className="player">
          <Form inline onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <Label>Name:&nbsp;&nbsp;</Label>
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
          {['New Game', 'Play AI', 'AI vs. AI'].map(button => (
            <Button
              key={button}
              color="danger"
              onClick={() => this.newGame(button)}
            >
              {redirect &&
                <Redirect to={`/${game.id}`} />
              }
              {button}
            </Button>
          ))}
        </article>
      </section>
    );
  }
});
