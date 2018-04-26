import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import * as functions from './functions';
import { Button, Form, FormGroup, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './styles/Home.css';

const mapStateToProps = (state) => ({
  player: state.default.player,
  games: state.default.games,
});
const mapDispatchToProps = (dispatch) => ({
  setPlayerName: (name) => dispatch(actions.setPlayerName(name)),
  syncGames: (games) => dispatch(actions.syncGames(games)),
});

export default connect(mapStateToProps, mapDispatchToProps)(class Home extends Component {
  constructor() {
    super();
    this.state = {
      gameDropdownOpen: false,
    };
  }

  selectGame(game) {
    console.log('you selected game: ', game);
  }

  async newGame() {
    const { player, syncGames } = this.props;
    const newGame = {
      name: '',
      player,
    };
    while (newGame.name === '') {
      newGame.name = prompt('Please enter a name for your game: ');
    }
    if (!newGame.name) return;
    syncGames(await functions.post('newGame', newGame));
  }

  async componentDidMount() {
    this.props.syncGames(await functions.get('allGames'));
    console.log(this.props.games);
  }

  render() {
    const { gameDropdownOpen } = this.state;
    const { player, games, setPlayerName } = this.props;

    return (
      <section className="home">
        <article className="title">
          Cat's Big 2
        </article>
        <article className="player">
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <Input
                value={player}
                onChange={(e) => setPlayerName(e.target.value)}
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
              {games.map((game, index) => (
                <DropdownItem
                  key={index} // not sure why key={game.id} throws warning message here
                  onClick={(e) => this.selectGame(game)}
                >
                  {game.name}
                </DropdownItem>  
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="danger"
            onClick={() => this.newGame()}
          >
            New Game
          </Button>
        </article>
      </section>
    );
  }
});
