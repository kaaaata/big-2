const _ = require('lodash');

// gameplay.js stores algorithms pertaining to gameplay logic. there is no shared data here.

const generateRandomDeck = () => _.shuffle(_.range(30, 154).filter(card => card % 10 <= 3));

const validPlay = (play) => {
  let cards = parseHand(play.cards),
    table = play.table ? parseHand(play.table) : null;

  if (!table && cards) {
    return true;
  } else if (!cards) {
    return false;
  } else {
    return cards.combo === table.combo && cards.power > table.power;
  }
};

const parseHand = (hand) => {
  // take hand like [140, 141, 142, 143] i.e. [A♦, A♣, A♥, A♠], and return { combo: '5x', power: 143 }, null if invalid

  const ranks = hand.map(card => ~~(card / 10)), // rank only i.e. [14, 14, 14, 14]
    suits = hand.map(card => card % 10); // suit only i.e. [0, 1, 2, 3]

  if (hand.length === 1) {
    return { combo: '1x', power: hand[0] };
  } else if (hand.length === 2 && allEqual(ranks)) {
    return { combo: '2x', power: hand[1] };
  } else if (hand.length === 3 && allEqual(ranks)) {
    return { combo: '3x', power: hand[2] };
  } else if (hand.length === 5) {
    const power = pokerPower(hand, ranks, suits);
    return power ? { combo: '5x', power } : null;
  } else {
    return null;
  }
};

const pokerPower = (hand, ranks, suits) => {
  // Inputs: hand [120, 121] ranks [12, 12] suits [1, 2]
  // Output: power
  // 1. straight: +1000 power (JQKA2 is highest, 23456 is lowest)
  // 2. flush: +2000 power
  // 3. full house: +3000 power
  // 4. four of a kind + 1: +4000 power
  // 5. straight flush: +5000 power

  const straight = allConsecutive(ranks),
    flush = allEqual(suits);

  if (straight && flush) {
    return 5000 + (ranks[4] === 15 && ranks[3] === 14 ? hand[3] : hand[4]) // JQKA2 is highest, 23456 is lowest
  } else if (allEqual(ranks.slice(0, 4) || allEqual(ranks.slice(1)))) {
    return 4000 + (allEqual(ranks.slice(0, 4))) ? ranks[0] : ranks[4];
  } else if (
      allEqual(ranks.slice(0, 3)) && allEqual(ranks.slice(3))
      || allEqual(ranks.slice(0, 2)) && allEqual(ranks.slice(2))
  ) {
    return 3000 + (allEqual(ranks.slice(0, 3)) ? hand[2] : hand[4]);
  } else if (flush) {
    return 2000 + ranks[4];
  } else if (straight) {
    return 1000 + (ranks[4] === 15 && ranks[3] === 14 ? hand[3] : hand[4]) // JQKA2 is highest, 23456 is lowest
  } else {
    return null;
  }
};

const allEqual = (array) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] != array[0]) return false;
  }
  return true;
};

const allConsecutive = (array) => {
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] + 1 != array[i + 1]) return false;
  }
  return true;
};

const rankCount = (card, array) => array.filter(item => ~~(item / 10) === ~~(card / 10)).length;

const allCombinations = (a, size) => {
  // given an (a)rray of cards, return all combinations with 'size' length (not permutations)
  // allCombinations([1, 2, 3], 2) => [[1, 2], [1, 3], [2, 3]]
  // CONSTANT TIME for 2 <= a <= 4 !!
  
  if (a.length <= 2) {
    if (size === 2) return [a]
  } else if (a.length === 3) {
    if (size === 2) return [[a[0], a[1]], [a[0], a[2]], [a[1], a[2]]];
    if (size === 3) return [a];
  } else if (a.length === 4) {
    if (size === 2) return [[a[0], a[1]], [a[0], a[2]], [a[0], a[3]], [a[1], a[2]], [a[1], a[3]], [a[2], a[3]]];
    if (size === 3) return [[a[0], a[1], a[2]], [a[0], a[1], a[3]], [a[0], a[2], a[3]], [a[1], a[2], a[3]]];
    if (size === 4) return [a];
  } else {
    return [];
  }
};

const all1x2x3x4x = (hand, x) => {
  // get all possible singles, pairs, triplets, or fours (x = 1, 2, 3, 4)

  let ret = [];

  if (x === 1) {
    ret = hand.map(card => [card]);
  } else {
    // 1. filter out singles, pairs, if necessary.
    const filterUnplayables = hand.filter(card => rankCount(card, hand) >= x);
    if (_.isEmpty(filterUnplayables)) return []; // end immediately if no playable hands
    // 2. partition by rank [[x, x], [x, x]]
    const partitionRanks = [[filterUnplayables[0]]];
    for (let i = 1; i < filterUnplayables.length; i++) {
      if (~~(filterUnplayables[i] / 10) === ~~(partitionRanks[partitionRanks.length - 1][0] / 10)) {
        partitionRanks[partitionRanks.length - 1].push(filterUnplayables[i]);
      } else {
        partitionRanks.push([filterUnplayables[i]]);
      }
    }
    // 3. add all perms in each rank division
    partitionRanks.forEach(partition => {
      ret = ret.concat(allCombinations(partition, x));
    });
  }
  // 4. finish
  return x === 4 ? ret : ret.sort((a, b) => parseHand(a).power - parseHand(b).power);
};

const all5x = (hand, x) => {
  // get straight flushes, four of a kinds, full houses, flushes, and straights

  if (hand.length < 5) return []; // end immediately if no playable hands

  const rank = (card) => ~~(card / 10);
  const suit = (card) => card % 10;

  let ret = [],
    ranks = hand.map(card => rank(card));

  if (x === '4x') {
    // 1. get all fours
    const fours = all1x2x3x4x(hand, 4); // like [[x, x, x, x]]
    // 2. for each four, add a single of every other rank
    fours.forEach(four => {
      hand.forEach(card => {
        if (rank(card) !== rank(four[0])) ret.push(four.concat([card]));
      });
    });
  } else if (x === 'full house') {
    // 1. get all pairs and triplets
    const pairs = all1x2x3x4x(hand, 2),
      triplets = all1x2x3x4x(hand, 3);
    // 2. for each pair, add a triplet of every other rank
    pairs.forEach(pair => {
      triplets.forEach(trip => {
        if (rank(trip[0]) !== rank(pair[0])) ret.push(pair.concat(trip));
      });
    });
  } else {
    // generate flushes and straights without returning. the intersection of these will be straight flushes
    // 1. generate all flushes with unique max rank with lowest 4 as fodder
    const flushes = [];
    [0, 1, 2, 3].forEach(_suit => {
      const filterSuit = hand.filter(card => suit(card) === _suit);
      if (filterSuit.length < 5) return;
      filterSuit.slice(4).forEach(flushMaxCard => {
        flushes.push(filterSuit.slice(0, 4).concat([flushMaxCard]));
      });
    });
    // 2. generate all straights
    let straights = [];
    for (let i = 0; i < hand.length; i++) {
      if (
        ranks.includes(rank(hand[i]) + 1)
        && ranks.includes(rank(hand[i]) + 2)
        && ranks.includes(rank(hand[i]) + 3)
        && ranks.includes(rank(hand[i]) + 4)
      ) {
        let newStraights = [[hand[i]]],
          additions = [];
        
        [1, 2, 3, 4].forEach(nextRank => {
          const allNextRank = hand.filter(card => rank(card) === ranks[i] + nextRank);
          allNextRank.forEach(nextRankCard => {
            newStraights.forEach(straight => {
              additions.push(straight.concat([nextRankCard]));
            });
          });
          newStraights = additions;
          additions = [];
        });
        straights = straights.concat(newStraights.filter(straight => straight.length === 5));
      }
    }
    // 3. generate all straight flushes
    // note: can't do straights.map(straight => flushes.includes(straight))because flushes doesn't contain every single flush
    const straightFlushes = straights.filter(straight => allEqual(straight.map(card => suit(card))));
    // 4. prepare to return
    if (x === 'straight') {
      ret = straights.filter(straight => !JSON.stringify(straightFlushes).includes(JSON.stringify(straight)));
    } else if (x === 'flush') {
      ret = flushes.filter(flush => !JSON.stringify(straightFlushes).includes(JSON.stringify(flush)));
    } else if (x === 'straight flush') {
      ret = straightFlushes;
    }
  }
  // 5. finish
  return ret.sort((a, b) => parseHand(a).power - parseHand(b).power);
};

const possibilities = (hand, table) => {
  // given a hand and a table, return all possible valid combinations to play to the table

  let ret = [];
  table = parseHand(table);

  // 1. add all possibilities (algorithm generates no duplicates)
  if (_.isEmpty(table)) {
    // what hands the AI will play first is determined in the weight() method.
    // the order is as below, although the below has no bearing on the actual order.
    ret = ret.concat(all5x(hand, 'straight'));
    ret = ret.concat(all1x2x3x4x(hand, 2));
    ret = ret.concat(all1x2x3x4x(hand, 1));
    ret = ret.concat(all1x2x3x4x(hand, 3));
    ret = ret.concat(all5x(hand, 'full house'));
    ret = ret.concat(all5x(hand, 'flush'));
    ret = ret.concat(all5x(hand, '4x'));
    ret = ret.concat(all5x(hand, 'straight flush'));
    return ret;
  } else if (['1x', '2x', '3x'].includes(table.combo)) {
    return all1x2x3x4x(hand, parseInt(table.combo[0])).filter(hand => parseHand(hand).power > table.power);
  } else if (table.combo === '5x') {
    if (table.power < 2000) ret = ret.concat(all5x(hand, 'straight'));
    if (table.power < 3000) ret = ret.concat(all5x(hand, 'flush'));
    if (table.power < 4000) ret = ret.concat(all5x(hand, 'full house'));
    if (table.power < 5000) ret = ret.concat(all5x(hand, '4x'));
    if (table.power < 6000) ret = ret.concat(all5x(hand, 'straight flush')); // ai will always add straight flush.
    return ret.filter(hand => parseHand(hand).power > table.power);
  }
};


module.exports = {
  generateRandomDeck,
  validPlay,
  parseHand,
  pokerPower,
  allEqual,
  allConsecutive,
  rankCount,
  allCombinations,
  all1x2x3x4x,
  all5x,
  possibilities
};
