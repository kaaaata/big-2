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
    this.addSingles = this.addSingles.bind(this);
    this.addPairs = this.addPairs.bind(this);
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
      this.addSingles();
		} else if (parsedTable.combo === '1x') {	
      this.addSingles();
      this.memory = this.memory.filter(hand => hand[0] > parsedTable.power);
		} else if (parsedTable.combo === '2x') {
      this.addPairs();
      this.memory = this.memory.filter(hand => hand[1] > parsedTable.power); 
		}

		console.log('AI can play: ', this.memory);
		return this.memory[0] || [];
  }

  addSingles() {
    // 1. finish
    this.hand.forEach(card => this.memory.push([card.big2rank]));
  }
  addPairs() {
    // 1. filter out singles
    const without_singles = this.hand.filter(card => this.rankCount(card, this.hand) >= 2);
    console.log(without_singles);
    // 2. partition by rank [[{}, {}], [{}, {}]]
    const partitioned_ranks = [[without_singles[0]]];
    for (let i = 1; i < without_singles.length; i++) {
      if (partitioned_ranks[partitioned_ranks.length - 1][0].rank === without_singles[i].rank) {
        partitioned_ranks[partitioned_ranks.length - 1].push(without_singles[i]);
      } else {
        partitioned_ranks.push([without_singles[i]]);
      }
    }
    console.log(partitioned_ranks);
    // 3. add all perms in each rank division
    let all_pairs = [];
    partitioned_ranks.forEach(partition => {
      all_pairs = all_pairs.concat(this.allCombinations(partition, 2));
    });
    console.log(all_pairs);
    // 4. finish
    all_pairs.forEach(pair => this.memory.push(pair.map(card => card.big2rank)));
  }

};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
