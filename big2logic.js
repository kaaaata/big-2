class Big2Logic {
	constructor() {
		// variables

		// bind
    this.parseHand = this.parseHand.bind(this);
		this.pokerPower = this.pokerPower.bind(this);
		this.allCombinations = this.allCombinations.bind(this);
		this.rankCount = this.rankCount.bind(this);
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
  
  quickAnimate(card, animateArgs, onComplete = () => {}, onStart = () => {}) {
		// shorthand to call card.prototype.animateTo()
		// const gameActive = this.gameActive; // deactivate game while animating (TO-DO)

		card.animateTo({
			x: animateArgs.x,
			y: animateArgs.y,
			delay: animateArgs.delay,
			duration: animateArgs.duration,
			ease: animateArgs.ease, 
			onStart: () => {
				// this.gameActive = null;
				onStart();
			},
			onComplete: () => {
				// this.gameActive = gameActive;
				onComplete();
			},
		});
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
	}

	allCombinations(a, size) {
		// given an (a)rray of cards, return all combinations with 'size' length (not permutations)
		// allCombinations([1, 2, 3], 2) => [[1, 2], [1, 3], [2, 3]]
		// only needs to work on arrays length 4 or less (CONSTANT TIME!)
		if (a.length <= 2) {
			if (size === 2) return [a];
		} else if (a.length === 3) {
			if (size === 2) return [[a[0], a[1]], [a[0], a[2]], [a[1], a[2]]];
			if (size === 3) return [a];
		} else if (a.length === 4) {
			if (size === 2) return [[a[0], a[1]], [a[0], a[2]], [a[0], a[3]], [a[1], a[2]], [a[1], a[3]], [a[2], a[3]]];
			if (size === 3) return [[a[0], a[1], a[2]], [a[0], a[1], a[3]], [a[0], a[2], a[3]], [a[1], a[2], a[3]]];
			if (size === 4) return [a];
		}
		return [];
	 };

	rankCount(card, hand) {
		// how many cards in hand have card's rank?
		let count = 0;
		hand.forEach(item => {
			count += item.rank === card.rank ? 1 : 0;
		});
		return count;
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
