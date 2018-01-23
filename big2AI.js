class Big2AI {
	constructor() {

	}

	generatePossibleHandsInOrderOfDesirability(AIhand, parsedTable, yourHandLength) { 
		// no cheating! AI cannot know your cards and does not count cards. 

		let possibilities = [];

		console.log('AI HAND: ', AIhand);
		console.log('TABLE: ', parsedTable);
		console.log('YOUR HAND LENGTH: ', yourHandLength);

		// lets start with singles only, and assume AI will play the next smallest single that beats table. 

		if (parsedTable.combo === '1x') {
			//console.log('table power: ', table[0].big2rank);
			//console.log('AI options: ', AIhand.map(card => card.big2rank));
			possibilities = AIhand.map(card => card.big2rank).filter(rank => rank > parsedTable.power);
		}

		return possibilities;
	}

};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
