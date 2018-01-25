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
    this.add1x2x3x = this.add1x2x3x.bind(this);
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
			console.log('AI detected table is empty. ');
      this.add1x2x3x(1);
		} else if (['1x', '2x', '3x'].includes(parsedTable.combo)) {
      console.log('AI detected combo is ', parsedTable.combo);
      const which1x2x3x = parseInt(parsedTable.combo[0]);
      this.add1x2x3x(which1x2x3x);
      this.memory = this.memory.filter(hand => hand[which1x2x3x - 1] > parsedTable.power);
    }
    
		console.log('AI can play: ', this.memory);
		return this.memory[0] || [];
  }

  add1x2x3x(x) {
    // add singles, pairs, or triplets to memory (x = 1, 2, or 3)
    if (x === 1) {
      this.hand.forEach(card => this.memory.push([card.big2rank]));
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
      let all_pairs = [];
      partition_ranks.forEach(partition => {
        all_pairs = all_pairs.concat(this.allCombinations(partition, x));
      });
      //console.log(all_pairs);
      // 4. finish
      all_pairs.forEach(pair => this.memory.push(pair.map(card => card.big2rank)));
    }
  }
};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
