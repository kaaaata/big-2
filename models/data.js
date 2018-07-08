const _ = require('lodash');

const gameplay = require('./gameplay');

// data.js stores shared data on server for sharing with clients.
let games = [],
  instructions = [],
  startingLife = 7;

const allGames = () => games;

const newGame = (newGame) => {
  // initialize a new game with one player in the p1 slot, returning the newly created game object
  // generate starting hands from randomized deck of big2ranks
  let deck = gameplay.generateRandomDeck(),
    game = {
      id: newGame.id,
      // all players and spectators have id, name, and life (representing whether they are active or not)
      players: [],
      p1Hand: deck.slice(0, 18),
      p2Hand: deck.slice(18, 36),
      activeCards: [],
      table: [],
      turn: 'p1',
      spectators: []
    },
    {
      p1,
      p2,
      spectator
    } = newGame;

  if (game.id.startsWith('1vAI_')) { // need to refactor AI life eventually
    game.players = [
      { id: p1.id, name: p1.name, life: startingLife },
      { id:p2.id, name: p2.name, life: 999999999999 }
    ];
  } else if (game.id.startsWith('AIvAI_')) {
    game.players = [
      { id: p1.id, name: p1.name, life: 999999999999 },
      { id: p2.id, name: p2.name, life: 999999999999 }
    ];
    game.spectators.push({ id: spectator.id, name: spectator.name, life: startingLife });
  } else {
    game.players = [{ id: p1.id, name: p1.name, life: startingLife }];
  }

  games.unshift(game);
  return game;
};

const readInstruction = (instruction) => {
  // read instruction from client, modifying the game object
  const {
    gameId,
    action,
    player,
    cards
  } = instruction;

  // modify the game object
  for (let i = 0; i < games.length; i++) {
    if (games[i].id !== gameId) continue;
    // activate or deactivate cards
    if (action === 'activate') {
      cards.forEach(card => {
        if (games[i].activeCards.includes(card)) {
          _.remove(games[i].activeCards, card);
        } else {
          games[i].activeCards.push(card);
        }
      });
    } else if (action === 'playActiveCards') {
      const hand = player === games[i].players[0].id ? 'p1Hand' : 'p2Hand',
        cards = games[i].activeCards.filter(card => games[i][hand].includes(card));

      games[i].table = cards;
      _.remove(games[i][hand], card => cards.includes(card));
      _.remove(games[i].activeCards, card => cards.includes(card));
      games[i].turn = hand === 'p1Hand' ? 'p2' : 'p1';
    } else if (action === 'newGame') {
      deck = gameplay.generateRandomDeck();
      games[i].p1Hand = deck.slice(0, 18);
      games[i].p2Hand = deck.slice(18, 36);
      games[i].activeCards = [];
      games[i].table = [];
    }

    // add the instruction for other clients to poll
    _.remove(instructions, instruction => instruction.gameId === gameId);
    instructions.push(instruction);
    return games[i];
  }
};

const fetchInstruction = (gameId) => {
  // when clients poll for instruction, retrieve both the instruction and the game object
  return {
    instruction: _.find(instructions, instruction => instruction.gameId === gameId),
    game: _.find(games, game => game.id === gameId)
  };
};

const joinGame = (gameInfo) => {
  const gameId = gameInfo.gameId,
    player = {
      id: gameInfo.player.id,
      name: gameInfo.player.name,
      life: startingLife
    };

  for (let i = 0; i < games.length; i++) {
    if (games[i].id !== gameId) continue;
    if (games[i].players.length === 1) {
      games[i].players.push(player);
    } else {
      games[i].spectators.push(player);
    }
    return games[i];
  }
};

const age = () => {
  // decrease player life every 1s if life reaches 0, player is 'disconnected'. life resets to startingLife every 5s from client.
  const gameIdsToDelete = [];
  games.forEach(game => {
    game.players.forEach(player => {
      player.life--;
      // if players have disconnected for too long, or if there are no spectators in AIvAI_, delete game.
      if (player.life === 0 || game.id.startsWith('AIvAI_') && _.isEmpty(game.spectators)) {
        gameIdsToDelete.push(game.id); // probably should not delete the game right away but let's work on this later
      }
    });
    game.spectators.forEach((spectator, index) => {
      spectator.life--;
      // if a spectator has disconnected for too long, remove them from the game
      if (spectator.life === 0) game.spectators.splice(index, 1);
    });
  });
  _.remove(games, game => gameIdsToDelete.includes(game.id));
  _.remove(instructions, instruction => gameIdsToDelete.includes(instruction.gameId));
};

const stayAlive = (playerId) => {
  games.forEach(game => {
    game.players.forEach(player => {
      if (player.id === playerId) player.life = startingLife;
    });
    game.spectators.forEach(spectator => {
      if (spectator.id === playerId) spectator.life = startingLife;
    });
  });
};

// start ticking down life
setInterval(age, 1000);


module.exports = {
  allGames,
  newGame,
  readInstruction,
  fetchInstruction,
  joinGame,
  age,
  stayAlive
};
