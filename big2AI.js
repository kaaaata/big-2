class Big2AI extends Big2Logic {
  // abstract AI class. AI has 'memory', which stores all hand combinations it can play on its turn
  // selectBestHandToPlay() continually adds to 'memory', and then plays the least valuable (first) one
  // this type of algorithm is scalable - you can adjust which hand it plays based on urgency i.e. your hand length

	constructor() {
    super();
    this.memory = []; // format: [[hand], [hand], [hand]]
    this.hand = []; // same as AIhand in selectBestHandToPlay
    this.table = {}; // same as parsedTable in selectBestHandToPlay

    this.selectBestHandToPlay = this.selectBestHandToPlay.bind(this);
    this.add1x2x3x4x = this.add1x2x3x4x.bind(this);
	}

	selectBestHandToPlay(AIhand, parsedTable, yourHandLength) { 
    // Inputs: take AIhand like [{}, {}], parsedTable like { combo: '1x', power: 141 }, yourHandLength like 2,
    // Output: this.memory after adding all relevant hands
		// no cheating! AI cannot know your cards and does not count cards like in poker. 
    this.memory = [];
    this.hand = AIhand;
    this.table = parsedTable;

		console.log(`AI hand cards ${AIhand.length} | table ${parsedTable} | player hand length ${yourHandLength}`);

		// lets assume AI will play the next smallest combo that beats table. 
		if (!parsedTable) {
			// lets assume for now that empty table = AI will play smallest single card. 
      this.add1x2x3x4x(1);
		} else if (['1x', '2x', '3x'].includes(parsedTable.combo)) {
      this.add1x2x3x4x(parseInt(parsedTable.combo[0]));
    } else if (parsedTable.combo === '5x') {
      if (parsedTable.power < 2000) this.add5x('straight');
      if (parsedTable.power < 3000) this.add5x('flush');
      if (parsedTable.power < 4000) this.add5x('full house');
      if (parsedTable.power < 5000) this.add5x('4x');
      if (parsedTable.power < 6000) this.add5x('straight flush'); // AI will always add straight flush. 
    }

    // get rid of cards that do not beat the table
    this.memory = this.memory.filter(hand => this.parseHand(hand).power > parsedTable.power)

		console.log('AI can play: ', this.memory);
		return this.memory[0] || [];
  }

  add1x2x3x4x(x, mode = 'memorize') {
    // get all possible singles, pairs, triplets, or fours (x = 1, 2, 3, 4)
    // mode = 'memorize': add to memory and return nothing. mode = 'return': return without adding to memory. 
    let allPossibilities = []; // not const to allow for concat utility
    if (x === 1) {
      allPossibilities = this.hand.map(card => [card]);
    } else {
      // 1. filter out singles, pairs, if necessary
      const filter_unplayables = this.hand.filter(card => this.rankCount(card, this.hand) >= x);
      //console.log(filter_unplayables);
      // 2. partition by rank [[{}, {}], [{}, {}]]
      const partition_ranks = [[filter_unplayables[0]]];
      for (let i = 1; i < filter_unplayables.length; i++) {
        if (partition_ranks[partition_ranks.length - 1][0].rank === filter_unplayables[i].rank) {
          partition_ranks[partition_ranks.length - 1].push(filter_unplayables[i]);
        } else {
          partition_ranks.push([filter_unplayables[i]]);
        }
      }
      //console.log(partition_ranks);
      // 3. add all perms in each rank division
      partition_ranks.forEach(partition => {
        allPossibilities = allPossibilities.concat(this.allCombinations(partition, x));
      });
      //console.log(allPossibilities);
    } 

    // finish
    if (mode === 'return') return allPossibilities;
    allPossibilities.forEach(item => this.memory.push(item.map(card => card.big2rank)));
  }

  add5x(x) {
    // add straight flushes, four of a kinds, full houses, flushes, and straights to memory
    const allPossibilities = [];    
    if (x === '4x') {
      // 1. get all fours
      const fours = this.add1x2x3x4x(4, 'return'); // like [[{}, {}, {}, {}]]
      // 2. for each four, add a single of every other rank
      fours.forEach(four => {
        this.hand.forEach(single => {
          if (single.rank !== four[0].rank) allPossibilities.push(four.concat([single]));
        });
      });
      console.log('all four possibilities: ', allPossibilities);
      // 3. finish
      allPossibilities.forEach(item => this.memory.push(item.map(card => card.big2rank)));
    } else if (x === 'full house') {
      // 1. get all pairs and triplets
      const pairs = this.add1x2x3x4x(2, 'return');
      const triplets = this.add1x2x3x4x(3, 'return');
      // 2. for each pair, add a triplet of every other rank
      pairs.forEach(pair => {
        triplets.forEach(triplet => {
          if (triplet[0].rank !== pair[0].rank) allPossibilities.push(pair.concat(triplet));
        });
      });
      console.log('all full house possibilities: ', allPossibilities);
      // 3. finish
      allPossibilities.forEach(item => this.memory.push(item.map(card => card.big2rank)));
    }
  }
};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/


/*
		if (straight && flush) {
			return 5000 + ((ranks[4] === 15 && ranks[3] === 14) ? hand[3] : hand[4]); // mathematically simplified;
		} else if (this.allEqual(ranks.slice(0, 4)) || this.allEqual(ranks.slice(1))) {
			return 4000 + (this.allEqual(ranks.slice(0, 4)) ? ranks[0] : ranks[4]);
		} else if (
			this.allEqual(ranks.slice(0, 3)) && this.allEqual(ranks.slice(3)) || 
			this.allEqual(ranks.slice(0, 2)) && this.allEqual(ranks.slice(2))) {
			return 3000 + (this.allEqual(ranks.slice(0, 3)) ? hand[2] : hand[4]);
		} else if (flush) {
			return 2000 + ranks[4];
		} else if (straight) {
			return 1000 + ((ranks[4] === 15 && ranks[3] === 14) ? hand[3] : hand[4]);
		} else {
			return false;
		}

*/