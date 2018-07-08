const assert = require('assert');

const gameplay = require('../models/gameplay');
const ai = require('../models/ai');
const minimax = require('../models/minimax');

describe('gameplay.js', () => {
  describe('generateRandomDeck', () => {
    it('should return an nonempty array', () => {
      const output = gameplay.generateRandomDeck();
      assert(Array.isArray(output));
      assert(output.length);
    });
  });

  describe('all1x2x3x4x', () => {
    it('should work for 1x', () => {
      const output = gameplay.all1x2x3x4x([30, 41, 52], 1);
      assert.deepEqual(output, [[30], [41], [52]]);
    });
    it('should work for 2x', () => {
      const output = gameplay.all1x2x3x4x([30, 31, 40, 41], 2);
      assert.deepEqual(output, [[30, 31], [40, 41]]);
    });
    it('should work for 3x', () => {
      const output = gameplay.all1x2x3x4x([30, 31, 33, 41, 42, 43], 3);
      assert.deepEqual(output, [[30, 31, 33], [41, 42, 43]]);
    });
    it('should work for 4x (without extra card)', () => {
      const output = gameplay.all1x2x3x4x([30, 31, 32, 33], 4);
      assert.deepEqual(output, [[30, 31, 32, 33]]);
    });
  });

  describe('all5x', () => {
    it('should work for 4x', () => {
      const output = gameplay.all5x([30, 31, 32, 33, 41, 51], '4x');
      assert.deepEqual(output, [[30, 31, 32, 33, 41], [30, 31, 32, 33, 51]]);
    });
    it('should work for full house', () => {
      const output = gameplay.all5x([30, 31, 32, 41, 42, 51, 53], 'full house');
      assert.deepEqual(output, [[41, 42, 30, 31, 32], [51, 53, 30, 31, 32]]);
    });
    it('should work for straight', () => {
      const output = gameplay.all5x([30, 31, 42, 53, 60, 71], 'straight');
      assert.deepEqual(output, [[30, 42, 53, 60, 71], [31, 42, 53, 60, 71]]);
    });
    it('should work for flush (bottom 4 as fodder)', () => {
      const output = gameplay.all5x([31, 41, 61, 62, 71, 81, 91], 'flush');
      assert.deepEqual(output, [[31, 41, 61, 71, 81], [31, 41, 61, 71, 91]]);
    });
    it('should work for straight flush', () => {
      const output = gameplay.all5x([31, 41, 51, 61, 71, 81, 92], 'straight flush');
      assert.deepEqual(output, [[31, 41, 51, 61, 71], [41, 51, 61, 71, 81]]);
    });
  });

  describe('possibilities', () => {
    it('should work on empty table', () => {
      const output = gameplay.possibilities([30, 41, 52, 63, 70, 73], []);
      const expected = [[30, 41, 52, 63, 70], [30, 41, 52, 63, 73], [70, 73], [30], [41], [52], [63], [70], [73]];
      assert.deepEqual(output, expected);
    });
    it('should work on 1x table', () => {
      const output = gameplay.possibilities([30, 41, 52, 63, 70, 73], [51]);
      const expected = [[52], [63], [70], [73]];
      assert.deepEqual(output, expected);
    });
    it('should work on 2x table', () => {
      const output = gameplay.possibilities([30, 31, 41, 52, 63, 70, 73], [40, 41]);
      const expected = [[70, 73]];
      assert.deepEqual(output, expected);
    });
    it('should work on 3x table', () => {
      const output = gameplay.possibilities([30, 31, 41, 52, 63, 70, 72, 73], [40, 41, 42]);
      const expected = [[70, 72, 73]];
      assert.deepEqual(output, expected);
    });
    it('should work on 5x table', () => {
      const output = gameplay.possibilities([31, 41, 51, 61, 71, 82, 90, 140, 141, 142, 150, 151], [40, 51, 62, 72, 83]);
      const expected = [[51, 61, 71, 82, 90], [31, 41, 51, 61, 141], [31, 41, 51, 61, 151], [150, 151, 140, 141, 142], [31, 41, 51, 61, 71]];
      assert.deepEqual(output, expected);
    });
    it('should give 5 singles in this scenario', () => {
      const output = gameplay.possibilities([82, 103, 112, 122, 131], []);
      const expected = [[82], [103], [112], [122], [131]];
      assert.deepEqual(output, expected);
    });
  });
});

describe('ai.js', () => {
  describe('selectBestHandToPlay', () => {
    it('should play a single in this scenario', () => {
      const cards = [31, 32, 41, 51, 61, 71, 72, 73, 82, 90, 140, 141, 142, 150, 151],
        table = [40],
        opponentCards = [33, 42, 43, 52, 53, 62, 63, 80, 81, 142],
        aggression = 2;
      const output = ai.selectBestHandToPlay(cards, table, opponentCards, aggression);
      console.log(output);
      assert(Array.isArray(output));
      assert(output.length === 1);
    });

    it('should play a single in this scenario', () => {
      const cards = [82, 103, 112, 122, 131],
        table = [],
        opponentCards = [121],
        aggression = 2;
      const output = ai.selectBestHandToPlay(cards, table, opponentCards, aggression);
      console.log(output);
      assert(Array.isArray(output));
      assert(output.length === 1);
    });
  });

  describe('runTraining', () => {
    it('should successfully run AI training one time', () => {
      const trainingParameters = {
        repetitions: 1,
        minAggression: 2,
        maxAggression: 2
      };
      const output = ai.runTraining(trainingParameters);
      assert(output);
    });
  });
});

describe('minimax.js', () => {
  describe('selectBestHandToPlay', () => {
    it('should return an nonempty array', () => {
      // simple case
      // const p1 = [31, 32];
      // const p2 = [41, 81];

      // complex case
      const p1 = [31, 32, 61, 62, 73, 90];
      const p2 = [41, 42, 51, 52, 70, 91];
      const output = minimax.selectBestHandToPlay(p1, p2, [], 'p1');
      console.log('best hand to play:', output);
      assert(Array.isArray(output));
      assert(output.length);
    });
  });
});
