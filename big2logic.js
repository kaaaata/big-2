class Big2Player {
	constructor(name) {
		this.name = name;
		this.hand = [];
		this.score = 0;
		this.algorithms = name === 'AI' ? new Big2AI() : null;
	}
};

class Big2Logic {
	constructor() {
		// variables

		// bind
		this.parseHand = this.parseHand.bind(this);
		this.pokerPower = this.pokerPower.bind(this);
		this.allEqual = this.allEqual.bind(this);
		this.allConsecutive = this.allConsecutive.bind(this);
	}

	parseHand(hand) {
		// take hand like [140, 141, 142, 143] i.e. [A♦, A♣, A♥, A♠], and return { combo: '5x', power: 143 }, false if invalid
		if (!hand) return null;

		const ranks = hand.map(card => ~~(card / 10)); // rank only i.e. [14, 14, 14, 14]
		const suits = hand.map(card => card % 10); // suit only i.e. [0, 1, 2, 3]
		
		if (hand.length <= 1) {
			return { combo: '1x', power: hand[0] };
		} else if (hand.length === 2 && this.allEqual(ranks)) {
			return { combo: '2x', power: hand[1] };
		} else if (hand.length === 3 && this.allEqual(ranks)) {
			return { combo: '3x', power: hand[2] }
		} else if (hand.length === 5) {
			const power = this.pokerPower.call(this, hand, ranks, suits);
			return power ? { combo: '5x', power: power } : false;
		} else {
			return false;
		}
	}

	pokerPower(hand, ranks, suits) {
		// take 5 card hand and return power value, false if invalid. note: 3 card hand can never exceed 100 power
		// straight: +100 power
		// flush: +200 power
		// full house: +300 power
		// four of a kind + 1: +400 power
		// straight flush: +500 power
		const isStraight = (array) => {
			// valid Big-2 straight? includes 34562 (biggest), 345A2 (second-biggest)
			if (
				this.allConsecutive(array) ||
				(this.allConsecutive(array.slice(0, 4)) && array[4] === 15) ||
				(this.allConsecutive(array.slice(0, 3)) && array[4] === 15 && array[3] === 14)) {
				return true;
			}
			return false;
		};
		const straight = isStraight(ranks);
		const flush = this.allEqual(suits);

		if (straight && flush) {
			return 500 + ((ranks[4] === 15 && ranks[3] === 14) ? hand[3] : hand[4]); // mathematically simplified;
		} else if (this.allEqual(ranks.slice(0, 4)) || this.allEqual(ranks.slice(1))) {
			return 400 + (this.allEqual(ranks.slice(0, 4)) ? ranks[0] : ranks[4]);
		} else if (
			this.allEqual(ranks.slice(0, 3)) && this.allEqual(ranks.slice(3)) || 
			this.allEqual(ranks.slice(0, 2)) && this.allEqual(ranks.slice(2))) {
			return 300 + (this.allEqual(ranks.slice(0, 3)) ? hand[2] : hand[4]);
		} else if (flush) {
			return 200 + ranks[4];
		} else if (straight) {
			return 100 + ((ranks[4] === 15 && ranks[3] === 14) ? hand[3] : hand[4]);
		} else {
			return false;
		}
	}

	allEqual(array) {
		// all items in array equal? 
		if (array.length <= 1) return true;
		for (let i = 0; i < array.length - 1; i++) {
			if (array[i] !== array[i + 1]) return false;
		}
		return true;
	}

	allConsecutive(array) {
		// all items in array consecutive?
		if (array.length <= 1) return true;
		for (let i = 0; i < array.length - 1; i++) {
			if (array[i] !== array[i + 1] - 1) return false;
		}
		return true;
	}
};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
