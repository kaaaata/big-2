class Big2 extends Big2Logic {
	constructor() {
		super();

		// variables
		this.logic = new Big2Logic();
		this.you = new Big2Player('you');
		this.AI = new Big2Player('AI');
		this.deck = Deck(); // no jokers
		this.table = [];
		this.turn = 'you';
		this.$container = document.getElementById('container'); // sets reference to DOM

		// bind
		this.playActiveCards = this.playActiveCards.bind(this);
		this.pass = this.pass.bind(this);
		this.renderHands = this.renderHands.bind(this);
		this.renderTable = this.renderTable.bind(this);
		this.clearOldHands = this.clearOldHands.bind(this);
		this.checkWin = this.checkWin.bind(this);
		this.quickAnimate = this.quickAnimate.bind(this);
		this.initGame = this.initGame.bind(this);
	}

	waste2seconds() {
  	return new Promise(resolve => {
    	setTimeout(() => {
      	resolve('resolved');
    	}, 2000);
  	});
	}

	playActiveCards(player) {
		// play all activated cards (transfer from hand to table)
		const playedCards = [];
		for (let i = 0; i < player.hand.length; i++) {
			if (player.hand[i].active) {
				playedCards.push(player.hand.splice(i--, 1)[0]);
			}
		}

		const playedCardsParsed = this.logic.parseHand(playedCards.map(card => card.big2rank));
		const tableCardsParsed = this.table.length > 0 ? this.logic.parseHand(this.table[(this.table[1] ? 1 : 0)].map(card => card.big2rank)) : null;

		console.log('you played: ', playedCardsParsed);

		// if your play is valid, and either it beats the table, or there is no table. 
		if (playedCardsParsed && !tableCardsParsed ||
			playedCardsParsed && tableCardsParsed &&
			playedCardsParsed.combo === tableCardsParsed.combo && playedCardsParsed.power >= tableCardsParsed.power) {
			this.table.push(playedCards);
			this.renderTable(true, this.checkWin);
		} else {
			console.log('Invalid Play', playedCards);
			player.hand = player.hand.concat(playedCards.splice(0));
			player.hand.filter(card => card.active).forEach((card) => card.$el.onclick());
		}
	}

	pass(player) {
		// all table goes away, turn changes
		const animateArgs = {
			x: window.innerWidth * -0.7,
			y: 0,
			delay: null, 
			duration: 500,
			ease: 'quartOut',
		};

		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
				animateArgs.delay = i * 20;
				this.quickAnimate(this.table[i][j], animateArgs,
					i === this.table.length - 1 && j === this.table[i].length - 1
					? () => {
						this.table = [];
						this.checkWin.call(this);
					}
					: () => {});
			}
		}
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
		this.you.hand = this.you.hand.sort((a, b) => (a.big2rank - b.big2rank));
		this.AI.hand = this.AI.hand.sort((a, b) => (a.big2rank - b.big2rank));

		// animate
		for (let i = 0; i < 18; i++) {
			[this.you.hand, this.AI.hand].forEach(hand => {
				if (hand[i]) {
					animateArgs.x = window.innerWidth * -0.4 + 15 * i;
					animateArgs.y = hand[i].y;
					animateArgs.delay = i * 20;
					this.quickAnimate(hand[i], animateArgs, () => hand[i].$el.style.zIndex = i);
				}
			});
		}
	}

	renderTable(fast = true, cb = () => {}) {
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
						this.renderHands();
						if (i === 2) { // note to self: this keeps going forever!!
							console.log('render table see table: ', this.table);
							if (j === this.table[2].length - 1) this.clearOldHands(cb);
						}
					}
				);
			}
		}
	}

	clearOldHands(cb) {
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
					? () => {
						this.renderTable(false);
						this.table = this.table.slice(0, 2);
						cb(); // cb i.e. checkWin from playActiveCards gets executed here
					}
					: () => {});
			}
		}
	};	

	checkWin() {
		if (this.you.hand.length === 0) {
			document.getElementById('scoreboard').innerHTML = 'You Win!';
			this.turn = null;
		} else if (this.AI.hand.length === 0) {
			document.getElementById('scoreboard').innerHTML = 'AI Wins!';
			this.turn = null;
		} else {
			if (this.turn === 'you') {
				console.log('you just finished turn. hands on table: ', this.table.length);
				this.turn = 'AI';
				// AI DO SOMETHING
				// this.AIplay.call(this,
				// 	this.AI.algorithms.generatePossibleHandsInOrderOfDesirability(
				// 		this.AI.hand,
				// 		this.logic.parseHand(this.table.length === 2 ? this.table[1].map(card => card.big2rank) : (this.table.length === 1 ? this.table[0].map(card => card.big2rank) : null)),
				// 		this.you.hand.length
				// 	), 
				// 	this.checkWin.bind(this)
				// ); 
				console.log('AI finished turn');
				this.turn = 'you';
			} else if (this.turn === 'AI') {
				console.log('AI just finished turn. ');
				this.turn = 'you';
			} 
		}
	}

	quickAnimate(card, animateArgs, onComplete = () => {}, onStart = () => {}) {
		// shorthand to call card.prototype.animateTo()
		const turn = this.turn; // deactivate input while animating

		card.animateTo({
			x: animateArgs.x,
			y: animateArgs.y,
			delay: animateArgs.delay,
			duration: animateArgs.duration,
			ease: animateArgs.ease, 
			onStart: () => {
				this.turn = null;
				onStart();
			},
			onComplete: () => {
				this.turn = turn;
				onComplete();
			},
		});
	}

	initGame() {		
		const animateArgs = { x: null, y: null, delay: null, duration: 500, ease: 'quartOut', };
		// declare key events
		document.onkeyup = (e) => {
			if (this.turn === 'you') {
				if (e.keyCode === 13) {
					console.log('you pressed enter');
					this.playActiveCards(this.you);
				} else if (e.keyCode === 80) {
					console.log('you passed turn');
					this.pass(this.you);
				}
			}
		};

		// deal cards
		this.deck.shuffle();
		this.deck.mount(this.$container); // add to DOM

		for (let i = 0; i < this.deck.cards.length; i++) {
			this.deck.cards[i].setSide('front');
			if (i >= 36) {
				// extra cards exit the screen
				animateArgs.x = this.deck.cards[i].x;
				animateArgs.y = window.innerHeight * -0.7;
				animateArgs.delay = 1500 + i * 20;
			} else if (i >= 18 && i < 36) {
				this.AI.hand.push(this.deck.cards[i]);
				animateArgs.x = window.innerWidth * -0.4 + 15 * (i - 18);
				animateArgs.y = window.innerHeight * -0.3;
				animateArgs.delay = 1000 + i * 20;
			} else if (i >= 0 && i < 18) {
				this.you.hand.push(this.deck.cards[i]);
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

		// modify each card object in this.deck to have Big-2-relevant properties
		animateArgs.delay = 0;
		animateArgs.duration = 100;

		this.deck.cards.forEach(card => {
			// create Big-2 specific ranks. (3 - card.suit) is suit power. they are x10 to avoid floating point arithmetic errors.
			card.big2rank = (card.rank === 1 ? 140 : (card.rank === 2 ? 150 : card.rank * 10)) + (3 - card.suit);
			if (card.suit === 0) card.unicodeSuit = '♠'; // unicode suits for prettiness (only used in console)
			if (card.suit === 1) card.unicodeSuit = '♥';
			if (card.suit === 2) card.unicodeSuit = '♣';
			if (card.suit === 3) card.unicodeSuit = '♦';
			card.active = false; // tracks whether a card in your hand is active i.e. 'popped out'
			card.$el.onclick = () => { // click a card to prepare it for play
				if (this.turn === 'you' && this.you.hand.map(card => card.big2rank).includes(card.big2rank)) {
					card.active = !card.active;
					animateArgs.x = card.x;
					animateArgs.y = card.y + (card.active ? 20 : -20) * -1;
					this.quickAnimate(card, animateArgs);
				}
			};
		});	
	}
};
