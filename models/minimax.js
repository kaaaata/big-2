const _ = require('lodash');

const gameplay = require('./gameplay');

class Node {
  constructor(p1, p2, table, turn, depth = 0) {
    this.p1 = p1; // p1 hand
    this.p2 = p2; // p2 hand
    this.turn = turn; // whos turn is it?
    this.table = table; // current table
    this.score = 0; // p1 wants a score of 100. p2 wants a score of -100
    this.children = []; // all possible next plays

    this.depth = depth; // for testing for now
  }
}

const setChildren = (node) => {
  // if the game is won, set the score to 100 or -100 depending on who won, and return
  if (_.isEmpty(node.p1)) {
    node.score = 100;
    return;
  } else if (_.isEmpty(node.p2)) {
    node.score = -100;
    return;
  }

  // generate all possibilities given hand and table
  let possibilities = gameplay.possibilities(node.turn === 'p1' ? node.p1 : node.p2, node.table);

  // if no possibilities (player passes), set children equal to all possibilities of the other player on a blank table
  if (_.isEmpty(possibilities)) {
    node.table = [];
    possibilities = gameplay.possibilities(node.turn === 'p1' ? node.p2 : node.p1, node.table);
    node.turn = node.turn === 'p1' ? 'p2' : 'p1';
  }

  // iterate through all possibilities, and add then as children nodes
  possibilities.forEach(possibility => {
    // update p1, p2
    let p1, p2;
    if (node.turn === 'p1') {
      p1 = node.p1.filter(item => !possibility.includes(item));
      p2 = node.p2;
    } else if (node.turn === 'p2') {
      p1 = node.p1;
      p2 = node.p2.filter(item => !possibility.includes(item));
    }
    node.children.push(new Node(p1, p2, possibility, node.turn === 'p2' ? 'p1' : 'p2', node.depth + 1));
  });

  // recursively populate children's children with minimaxed scores
  node.children.forEach(child => {
    setChildren(child);
    // set the score to the largest/smallest score, prioritizing less depth over more depth
    const newScore = child.score > 0 ? child.score - 1 : child.score + 1;
    if (
      node.turn === 'p1' && newScore > node.score
      || node.turn === 'p2' && newScore < node.score
    ) {
      node.score = newScore;
    }
  });
};

const countNodes = (node) => {
  // console.log(`depth: ${node.depth}, p1: ${node.p1}, p2: ${node.p2}, turn: ${node.turn}, table: ${node.table}, score: ${node.score}`);
  // console.log(' -- done -- ');
  let count = 1;
  node.children.forEach(child => {
    count += countNodes(child);
  });
  return count;
};

const selectBestHandToPlay = (p1, p2, table, turn) => {
  const minimaxTree = new Node(p1, p2, table, turn);
  setChildren(minimaxTree);

  // console.log('# nodes:', countNodes(minimaxTree));
  // console.log('table:', minimaxTree.table);

  // if terminal node, or player must pass, play nothing
  if (_.isEmpty(minimaxTree.children) || minimaxTree.turn !== turn) {
    // console.log('pass');
    return [];
  }

  // otherwise, use minimax scoring system to determine the best hand to play
  let currentHand, newHand;
  if (minimaxTree.turn === 'p1') {
    currentHand = minimaxTree.p1;
    newHand = _.maxBy(minimaxTree.children, 'score').p1;
  } else if (minimaxTree.turn === 'p2') {
    currentHand = minimaxTree.p2;
    newHand = _.maxBy(minimaxTree.children, 'score').p2;
  }

  return currentHand.filter(card => !newHand.includes(card));
};


module.exports = {
  setChildren,
  countNodes,
  selectBestHandToPlay
};
