const _ = require('lodash');

const gameplay = require('./gameplay');
const minimax = require('./minimax');

// ai.js stores the algorithm to calculate the best hand for the AI to play, given certain inputs.

const wins = {}, // record AI # wins during training
  games = {}; // record AI # games during training

const runTraining = (trainingParameters) => {
  // given some training parameters, run a training regimen.

  // map parameters and initialize wins/games tracking
  const {
    repetitions,
    minAggression,
    maxAggression
  } = trainingParameters;

  _.range(minAggression, maxAggression + 1).forEach(aggression => {
    wins[aggression] = 0;
    games[aggression] = 0;
  });

  // play the games
  _.range(minAggression, maxAggression + 1).forEach(aggressionI => {
    // Array(maxAggression - minAggression + 1).fill(18).forEach(aggressionK => { // enable this line to play against a specific AI
    _.range(minAggression, maxAggression + 1).forEach(aggressionJ => {
      _.range(0, repetitions).forEach(repetition => {
        train(aggressionI, aggressionJ);
      });
    });
  });

  // print training results
  Object.keys(wins).forEach(key => {
    const winCount = wins[key],
      gameCount = games[key],
      winrate = Math.round(100 * winCount / gameCount);
    
      console.log(`Aggression ${key}: ${winrate}% winrate (${winCount}/${gameCount})`);
  });

  return true;
};

const train = (aggressionI, aggressionJ) => {
  console.log('training 1 game');
  // run one AI training game (only to be called from runTraining())

  // initialize game
  let deck = gameplay.generateRandomDeck(),
    iHand = deck.slice(0, 18).sort((a, b) => a - b),
    jHand = deck.slice(18, 36).sort((a, b) => a - b),
    table = [];

  // track winrate statistics
  games[aggressionI]++;
  games[aggressionJ]++;

  // run the 'game'
  while (true) {
    table = selectBestHandToPlay(iHand, table, jHand, aggressionI);
    _.remove(iHand, card => table.includes(card));
    if (_.isEmpty(iHand)) {
      wins[aggressionI]++;
      break;
    }
    table = selectBestHandToPlay(jHand, table, iHand, aggressionJ);
    _.remove(jHand, card => table.includes(card));
    if (_.isEmpty(jHand)) {
      wins[aggressionJ]++;
      break;
    }
  }

  return true;
};

const weight = (play, hand) => {
  // low weight = do not play. high weight = omg plz play!
  let weight = 1000000, // highest weight = 1000000 = default
    disruptionValue = 0,
    combo = gameplay.parseHand(play).combo;

  // if the play is literally the entire hand, it has the highest weight
  if (play.length === hand.length) return weight;

  // components of weight: 
  // 1. power of the hand: high power = strong hand = valuable = low weight (want to save best cards for later)
  // 2. disruption: high disruption = low weight (don't want to break up other hands)
  // note: a hand cannot disrupt other hands with the same combo i.e. 3x can't disrupt 3x. 

  // decrease the weight by the power of the hand, so AI will play weaker hands first
  weight -= gameplay.parseHand(play).power;

  // decrease the weight by disruption value. high disruption = higher decrease in weight
  // assign disruption weights based on hand type (this is the ordering of hands AI will play)
  if (combo === 'straight') {
    disruptionValue += 0;
  } else if (combo === '2x') {
    disruptionValue += 10000;
  } else if (combo === '1x') {
    disruptionValue += 20000;
  } else if (combo === '3x') {
    disruptionValue += 30000;
  } else if (combo === 'full house') {
    disruptionValue += 40000;
  } else if (combo === 'flush') {
    disruptionValue += 50000;
  } else if (combo === '4x') {
    disruptionValue += 60000;
  } else if (combo === 'straight flush') {
    disruptionValue += 70000;
  }

  // assign disruption weights based on actual hands disrupted
  if (combo !== 'straight flush') {
    gameplay.all5x(hand, 'straight flush').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 250;
    });
  } else if (combo != '4x') {
    gameplay.all5x(hand, '4x').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 100;
    });
  } else if (combo != 'full house') {
    gameplay.all5x(hand, 'full house').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 50;
    });
  } else if (combo != '3x') {
    gameplay.all1x2x3x4x(hand, '3x').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 25;
    });
  } else if (combo != '2x') {
    gameplay.all1x2x3x4x(hand, '2x').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 10;
    });
  } else if (combo != 'straight') {
    gameplay.all5x(hand, 'straight').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 5;
    });
  } else if (combo != 'flush') {
    gameplay.all5x(hand, 'flush').forEach(hand => {
      disruptionValue += hand.filter(card => play.includes(card)).length * 1;
    });
  }

  return weight - disruptionValue;
};

const selectBestHandToPlay = (hand, table, opponentCards, aggression) => {
  // select theoretical best hand to play given hand, table, opponentCards, aggression
  // 1. if the hands are small enough, use minimax
  // 2. otherwise, get all possible plays in order from smallest to largest (possible play = can play and beat table)
  // 3. assign each play a weight based on its power and its disruption and choose the best one (highest weight)

  // 'slam jam it' if AI can win this turn
  if (_.isEmpty(table) && gameplay.parseHand(hand)) return hand;

  // console.log('current table', table);
  // use minimax if hands are small enough
  if (hand.length + opponentCards.length <= 12) return minimax.selectBestHandToPlay(hand, opponentCards, table, 'p1');

  // generate all the possibile hands, put a disruption value on each hand, and pick the optimal one based on given parameters
  // hands are ordered from lowest strength to highest strength

  const possibilities = gameplay.possibilities(hand, table).map(possibility => {
    return {
      cards: possibility,
      weight: weight(possibility, hand)
    };
  });
  // print hand and all possibilities of that hand
  // console.log('hand: ', hand);
  // console.log(possibilities);
  return _.isEmpty(possibilities)
    ? []
    : aggression <= opponentCards.length || aggression <= hand.length
      ? _.maxBy(possibilities, 'weight').cards
      : possibilities[possibilities.length - 1].cards;
};


module.exports = {
  runTraining,
  train,
  weight,
  selectBestHandToPlay  
};
