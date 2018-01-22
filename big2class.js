class Big2Player {
	constructor() {
		this.hand = [];
		this.score = [];
	}
};

class Big2 {
	constructor() {
		this.logic = new Big2Logic();
		this.you = new Big2Player();
		this.opp = new Big2Player();
		this.deck = Deck(); // no jokers
		this.table = [];
		this.turn = null;
		this.$container = document.getElementById('container'); // sets reference to DOM

		this.deck.shuffle();
		this.deck.mount(this.$container); // add to DOM
	}



	quickAnimate(card, animateArgs, cb = () => {}) {
		// shorthand to call card.prototype.animateTo()
		card.animateTo({
			x: animateArgs.x,
			y: animateArgs.y,
			delay: animateArgs.delay,
			duration: animateArgs.duration,
			ease: animateArgs.ease, 
			onComplete: () => cb(),
		});
	}

	initDeck() {
		// modify each card object in this.deck to have Big-2-relevant properties
		const animateArgs = {
			x: null,
			y: null,
			delay: 0, 
			duration: 100,
			ease: 'quartOut',
		};

		this.deck.cards.forEach(card => {
			if (card.rank === 1) { // adjusting ranks. they are multiplied by 10 to avoid floating point arithmetic errors with suits. 
				card.big2rank = 140;
			} else if (card.rank === 2) {
				card.big2rank = 150;
			} else {
				card.big2rank = card.rank * 10;
			}
			card.big2absoluteRank = card.big2rank + (3 - card.suit); // absolute Big-2 rank for sorting. (3 - card.suit) is Big-2-suit power
			if (card.suit === 0) card.unicodeSuit = '♠'; // unicode suits for prettiness
			if (card.suit === 1) card.unicodeSuit = '♥';
			if (card.suit === 2) card.unicodeSuit = '♣';
			if (card.suit === 3) card.unicodeSuit = '♦';
			card.active = false; // tracks whether a card in your hand is active
			card.position = 'table'; // where's it at? 'table', 'yourHand', 'oppsHand'
			card.$el.onclick = () => {
				if (!['yourHand', 'oppsHand'].includes(card.position)) return;
				card.active = !card.active;
				animateArgs.x = card.x;
				animateArgs.y = card.y + (card.active ? 20 : -20) * (card.position === 'yourHand' ? -1 : 1);
				this.quickAnimate(card, animateArgs);
			};
		});	
	}

	renderHands() {
		const animateArgs = {
			x: null,
			y: null,
			delay: null,
			duration: 500,
			ease: 'quartOut',
		};

		// sort
		this.you.hand = this.you.hand.sort((a, b) => (a.big2absoluteRank - b.big2absoluteRank));
		this.opp.hand = this.opp.hand.sort((a, b) => (a.big2absoluteRank - b.big2absoluteRank));

		// animate
		for (let i = 0; i < 18; i++) {
			[this.you.hand, this.opp.hand].forEach(hand => {
				if (hand[i]) {
					animateArgs.x = window.innerWidth * -0.4 + 15 * i;
					animateArgs.y = hand[i].y;
					animateArgs.delay = i * 100;
					this.quickAnimate(hand[i], animateArgs, () => hand[i].$el.style.zIndex = i);
				}
			});
		}
	}

	renderTable(fast = true) {
		const animateArgs = {
			x: null,
			y: 0,
			delay: null, 
			duration: 500,
			ease: 'quartOut',
		};

		// add everything to the table 
		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
				animateArgs.x = window.innerWidth * -0.4 + 15 * j + 155 * i;
				animateArgs.delay = fast ? j * 20 : j * 10;
				this.quickAnimate(this.table[i][j], animateArgs,
					() => {
						this.renderHands.call(this);
						if (i === 2 && j === this.table[2].length - 1) this.clearOldHands.call(this);
					}
				);
			}
		}
	}

	clearOldHands() {
		// all hands except most recently played 2 hands fall off table
		const animateArgs = {
			x: window.innerWidth * -0.7,
			y: 0,
			delay: null, 
			duration: 500,
			ease: 'quartOut',
		};

		if (this.table.length === 3) {
			for (let i = 0; i < this.table[0].length; i++) {
				animateArgs.delay = i * 20;
				this.quickAnimate(this.table[0][i], animateArgs,
					i === this.table[0].length - 1
					? () => this.renderTable.call(this, false)
					: () => {});
			}
			this.table = this.table.slice(1);
		}
	};	

	playActiveCards(player) {
		// play all activated cards (transfer from hand to table)
		const playedCards = [];
		for (let i = 0; i < player.hand.length; i++) {
			if (player.hand[i].active) {
				playedCards.push(player.hand.splice(i--, 1)[0]);
			}
		}

		this.table.push(playedCards);
		console.log('Played: ', this.logic.parseHand(playedCards.map(card => card.big2absoluteRank)));
		this.renderTable();
	}

	initGame() {
		document.onkeyup = (e) => {
			if (e.keyCode === 13 && this.turn === 'you') {
				this.playActiveCards(this.you);
			}
		};

		// deal
		const animateArgs = {
			x: null,
			y: null,
			delay: null, 
			duration: 500,
			ease: 'quartOut',
		};

		for (let i = 0; i < this.deck.cards.length; i++) {
			this.deck.cards[i].setSide('front');
			if (i >= 36) {
				// extra cards exit the screen
				animateArgs.x = this.deck.cards[i].x;
				animateArgs.y = window.innerHeight * -0.7;
				animateArgs.delay = 1500 + i * 20;
			} else if (i >= 18 && i < 36) {
				this.opp.hand.push(this.deck.cards[i]);
				this.deck.cards[i].position = 'oppsHand';
				animateArgs.x = window.innerWidth * -0.4 + 15 * (i - 18);
				animateArgs.y = window.innerHeight * -0.3;
				animateArgs.delay = 1000 + i * 20;
			} else if (i >= 0 && i < 18) {
				this.you.hand.push(this.deck.cards[i]);
				this.deck.cards[i].position = 'yourHand';
				animateArgs.x = window.innerWidth * -0.4 + 15 * i;
				animateArgs.y = window.innerHeight * 0.3;
				animateArgs.delay = 1000 + i * 20;
			}
			this.quickAnimate(this.deck.cards[i], animateArgs,
				i === this.deck.cards.length - 1
				? this.renderHands.bind(this)
				: () => {}
			);
		}

		this.turn = 'you';
	}
};
