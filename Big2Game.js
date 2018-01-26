class Big2Game extends Big2Logic {
	constructor() {
		super();

		// variables
		this.you = new Big2Player('you');
    this.AI = new Big2Player('AI');
    this.AIalgorithms = new Big2AI();
		this.deck = Deck(); // no jokers
		console.log('Deck: ', this.deck);
		this.table = []; 
		this.handSort = 'ranks';
		this.gameActive = true; // game deactivated when cards are rendering or a player has won (and eventually when AI is moving?)
		this.$container = document.getElementById('container'); // sets reference to DOM

    // bind
    this.quickAnimate = this.quickAnimate.bind(this);

		this.playActiveCards = this.playActiveCards.bind(this);
		this.wipeTable = this.wipeTable.bind(this);
		this.renderHands = this.renderHands.bind(this);
		this.renderTable = this.renderTable.bind(this);
    this.clearOldHands = this.clearOldHands.bind(this);
    this.AIturn = this.AIturn.bind(this);
		this.checkWin = this.checkWin.bind(this);
		this.initGame = this.initGame.bind(this);
	}

	wasteTime(seconds) {
  	return new Promise(resolve => {
    	setTimeout(() => {
      	resolve('resolved');
    	}, 1000 * seconds);
  	});
	}

	playActiveCards(player) {
		// play all activated cards, or pass (transfer from hand to table)
		const playedCards = [];
		for (let i = 0; i < player.hand.length; i++) {
			if (player.hand[i].active) {
				playedCards.push(player.hand.splice(i--, 1)[0]);
			}
		}
		
		const playedCardsParsed = this.parseHand(playedCards.map(card => card.big2rank));
		const tableCardsParsed = this.table.length > 0 ? this.parseHand(this.table[(this.table[1] ? 1 : 0)].map(card => card.big2rank)) : { combo: null, power: 0 };

		console.log(`${player.name} played: ${playedCardsParsed} to table: ${tableCardsParsed}`);
		

		if (
			// valid play? does it beat board or the board is empty? ok, play it.
			playedCardsParsed && !tableCardsParsed.combo ||
			playedCardsParsed && tableCardsParsed.combo &&
			playedCardsParsed.combo === tableCardsParsed.combo && playedCardsParsed.power >= tableCardsParsed.power) {
			this.table.push(playedCards);
			this.renderTable(true, () => this.checkWin(player.name));
		} else {
			// invalid play? put the cards back into the hand (deactivate)
			console.log('Invalid Play', playedCards);
			player.hand = player.hand.concat(playedCards.splice(0));
			player.hand.filter(card => card.active).forEach((card) => card.activate(player.name));
		}
	}

	wipeTable(cb) {
		const animateArgs = { x: window.innerWidth * -0.7, y: 0, delay: null, duration: 500, ease: 'quartOut', };

    // empty table = do callback and end
    if (!this.table.length) {
      setTimeout(cb, 500); // ok to use setTimeout because the table will only be empty on game start. (no stack)
      return;
    }

    // not empty table: do algorithm.
		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
				animateArgs.delay = 500 + i * 20;
				this.quickAnimate(this.table[i][j], animateArgs,
					i === this.table.length - 1 && j === this.table[i].length - 1
					? () => {
						this.table = [];
						if (cb) cb();
					}
					: () => {});
			}
		}
	}

	renderHands(handSort = 'ranks') {
		const animateArgs = { x: null, y: null, delay: null, duration: 500, ease: 'quartOut', };

		// sort
		if (handSort === 'ranks') {
			this.you.hand = this.you.hand.sort((a, b) => (a.big2rank - b.big2rank));
			this.AI.hand = this.AI.hand.sort((a, b) => (a.big2rank - b.big2rank));
		} else if (handSort === 'suits') {
			let youNewHand = [];
			let AINewHand = [];
			[3, 2, 1, 0].forEach(suit => {
				youNewHand = youNewHand.concat(this.you.hand.sort((a, b) => (b.suit - a.suit)).filter(card => card.suit === suit).sort((a, b) => (a.big2rank - b.big2rank)));
				AINewHand = AINewHand.concat(this.AI.hand.sort((a, b) => (b.suit - a.suit)).filter(card => card.suit === suit).sort((a, b) => (a.big2rank - b.big2rank)));
			});
			this.you.hand = youNewHand;
			this.AI.hand = AINewHand;
		}

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

	renderTable(fast = true, cb) {
		const animateArgs = { x: null, y: 0, delay: null, duration: 500, ease: 'quartOut', };

		// add everything to the table 
		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
				animateArgs.x = window.innerWidth * -0.4 + 15 * j + 155 * i;
				animateArgs.delay = fast ? j * 20 : j * 10;
				this.quickAnimate(this.table[i][j], animateArgs,
					() => {
						if (i === this.table.length - 1) {
							if (i === 2 && j === this.table[2].length - 1) {
								this.clearOldHands(cb);
							} else if (i < 2 && j === this.table[i].length - 1) {
								if (cb) cb(); // cb i.e. checkWin from playActiveCards gets executed here
								this.renderHands(this.handSort);
							}
						}
					}
				);
			}
		}
	}

	clearOldHands(cb) {
		// all hands except most recently played 2 hands fall off table
		const animateArgs = { x: window.innerWidth * -0.7, y: 0, delay: null, duration: 500, ease: 'quartOut', };

		if (this.table.length === 3) {
			for (let i = 0; i < this.table[0].length; i++) {
				animateArgs.delay = i * 20;
				this.quickAnimate(this.table[0][i], animateArgs,
					i === this.table[0].length - 1
					? () => {
						this.table = this.table.slice(1);
						this.renderTable(false);
						cb(); // cb i.e. checkWin from playActiveCards gets executed here
					}
					: () => {});
			}
		}
	};	

  AIturn() {
    const AIwillPlay = this.AIalgorithms.selectBestHandToPlay.call(this,
      this.AI.hand,
      this.parseHand(this.table.length === 2
        ? this.table[1].map(card => card.big2rank)
        : (this.table.length === 1 ? this.table[0].map(card => card.big2rank) : [0])),
      this.you.hand.length
    );
    if (!AIwillPlay.length) {
      console.log('AI passed. ');
      this.wipeTable();
    } else {
      console.log('AI HAND HOLDS THIS RANKS: ', this.AI.hand.map(card => card.big2rank));
      this.AI.hand.filter(card => AIwillPlay.includes(card.big2rank)).forEach((card) => card.activate('AI'));
      console.log('AI hand activated these many cards: ', this.AI.hand.filter(card => card.active).length);
      //const wasteTime = await this.wasteTime(1); // this line is for cool delay effect but it messes everything up
      this.playActiveCards(this.AI);
    }
  }

	checkWin(playerName) {
		console.log(`checking if ${playerName} won`);
		if (playerName === 'you') {
			if (this.you.hand.length === 0) {
				document.getElementById('scoreboard').innerHTML = 'You Win!';
				this.gameActive = false;
				return;
			}
			this.AIturn();
		} else if (playerName === 'AI') {
			if (this.AI.hand.length === 0) {
				document.getElementById('scoreboard').innerHTML = 'AI Wins!';
				this.gameActive = false;
				return;
			}
			console.log('AI just finished turn. ');	
		}
	}

	initGame() {		
		const animateArgs = { x: null, y: null, delay: null, duration: 500, ease: 'quartOut', };
		// declare key events
		document.onkeyup = (e) => {
			if (this.gameActive) {
				if (e.keyCode === 13) {
					console.log('you pressed enter');
					this.playActiveCards(this.you);
				} else if (e.keyCode === 80) {
					console.log('You passed. ');
          this.you.hand.filter(card => card.active).forEach((card) => card.activate('you'));
          this.wipeTable(this.AIturn);
				} else if (e.keyCode === 83) {
					this.handSort = this.handSort === 'ranks' ? 'suits' : 'ranks';
					console.log('sorting based on: ', this.handSort);
					this.renderHands(this.handSort);
				}
			}
		};

		// add to DOM
		this.deck.mount(this.$container);

		// deal cards

		// // CUSTOMIZED DEALS FOR TESTING
		// for (let i = 0; i < this.deck.cards.length; i++) {
		// 	this.deck.cards[i].setSide('front');
		// 	if (this.deck.cards[i].rank >= 9) {
		// 		// extra cards exit the screen
		// 		animateArgs.x = this.deck.cards[i].x;
		// 		animateArgs.y = window.innerHeight * -0.7;
		// 		animateArgs.delay = 1500 + i * 20;
		// 	} else if (this.deck.cards[i].rank >= 5 && this.deck.cards[i].rank < 9) {
		// 		this.AI.hand.push(this.deck.cards[i]);
		// 		animateArgs.x = window.innerWidth * -0.4 + 15 * (i - 18);
		// 		animateArgs.y = window.innerHeight * -0.3;
		// 		animateArgs.delay = 1000 + i * 20;
		// 	} else if (this.deck.cards[i].rank < 5) {
		// 		this.you.hand.push(this.deck.cards[i]);
		// 		animateArgs.x = window.innerWidth * -0.4 + 15 * i;
		// 		animateArgs.y = window.innerHeight * 0.3;
		// 		animateArgs.delay = 1000 + i * 20;
		// 	}
		// 	this.quickAnimate(this.deck.cards[i], animateArgs,
		// 		i === this.deck.cards.length - 1
		// 		? this.renderHands
		// 		: () => {}
		// 	);
		// }
		
		this.deck.shuffle();
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
				? () => this.renderHands(this.handSort)
				: () => {}
			);
		}
		
    // modify each card object in this.deck to have Big-2-relevant properties
    // properties are added instead of subclassing for simplicity...the deck_of_cards _card class is already great
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
			card.activate = (playerName) => {
				card.active = !card.active;
				animateArgs.x = card.x;
				animateArgs.y = card.y + (card.active ? 20 : -20) * (playerName === 'you' ? -1 : 1);
				this.quickAnimate(card, animateArgs);
			};
			card.$el.onclick = () => { // click a card to prepare it for play
				if (this.gameActive && this.you.hand.map(card => card.big2rank).includes(card.big2rank)) card.activate('you');
			};
		});	
	}
};
