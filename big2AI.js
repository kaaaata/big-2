class Big2AI {
  // abstract AI class. AI has 'memory', which stores all hand combinations it can play on its turn
  // selectBestHandToPlay() continually adds to 'memory', and then plays the least valuable (first) one
  // this type of algorithm is scalable - you can adjust which hand it plays based on urgency i.e. your hand length

	constructor() {
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
    this.hand.forEach(card => this.memory.push([card.big2rank]));
  }
  addPairs() {
    // in progress
  }
};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
