class Big2Logic {
	constructor() {

	}

	helloWorld() {
		console.log('Hello World!');
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

	pokerPower(hand, handRank, handSuit) {
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
		const straight = isStraight(handRank);
		const flush = this.allEqual(handSuit);

		if (straight && flush) {
			return 500;
		} else if (this.allEqual(handRank.slice(0, 4)) || this.allEqual(handRank.slice(1))) {
			return 400;
		} else if (
			(this.allEqual(handRank.slice(0, 3)) && this.allEqual(handRank.slice(3))) || 
			(this.allEqual(handRank.slice(0, 2)) && this.allEqual(handRank.slice(2)))) {
			return 300;
		} else if (flush) {
			return 200;
		} else if (straight) {
			return 100;
		} else {
			return false;
		}
	}

	parseHand(hand) {
		// take hand like [140, 141, 142, 143] i.e. [A♦, A♣, A♥, A♠], and return { combo: '4x', power: 143 }, false if invalid
		const handRank = hand.map(card => ~~(card / 10)); // rank only
		const handSuit = hand.map(card => card % 10); // suit only
		
		if (hand.length <= 1) {
			return { combo: '1x', power: hand[0] };
		} else if (hand.length === 2 && this.allEqual(handRank)) {
			return { combo: '2x', power: hand[1] };
		} else if (hand.length === 3 && this.allEqual(handRank)) {
			return { combo: '3x', power: hand[2] }
		} else if (hand.length === 5) {
			const power = this.pokerPower.call(this, hand, handRank, handSuit);
			return power ? { combo: '5x', power: power } : false;
		} else {
			return false;
		}
	}
};

/* POSSIBLE HANDS
As Singles (just one card)
As Pairs (two cards of matching values)
As Triplets or “Trips” (three cards of matching values)
As Poker Hands (five cards forming a straight, flush, full house, four of a kind or straight flush)
*/
