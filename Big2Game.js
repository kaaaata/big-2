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
		this.handSort = 'ranks'; // hand sorting method. 'ranks' or 'suits
		this.gameActive = false; // game deactivated when cards are rendering or a player has won (and eventually when AI is moving?)
		this.$container = document.getElementById('container'); // sets reference to DOM

    // bind
    this.asyncAnimate = this.asyncAnimate.bind(this);

		this.playActiveCards = this.playActiveCards.bind(this);
		this.wipeTable = this.wipeTable.bind(this);
		this.renderHands = this.renderHands.bind(this);
		this.renderTable = this.renderTable.bind(this);
    this.clearOldHands = this.clearOldHands.bind(this);
    this.AIturn = this.AIturn.bind(this);
		this.scorePoints = this.scorePoints.bind(this);
		this.initGame = this.initGame.bind(this);

		// init
		this.initGame();
	}

	wasteTime(seconds) {
		// a useless function
  	return new Promise(resolve => {
    	setTimeout(() => {
        console.log('finished wasting time');
        resolve('finished wasting time');
      }, 1000 * seconds);
    });
	}

	async playActiveCards(player) {
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
		} else {
			// invalid play? put the cards back into the hand (deactivate)
			console.log('Invalid Play', playedCards);
			player.hand = player.hand.concat(playedCards.splice(0));
			player.hand.filter(card => card.active).forEach((card) => card.activate(player.name));
		}
	}

	async wipeTable() {
		const animateArgs = { x: window.innerWidth * -0.7, y: 0, delay: null, duration: 500, ease: 'quartOut', };

    if (!this.table.length) return;

    // not empty table: do algorithm.
		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
        animateArgs.delay = i * 20;
        this.asyncAnimate(this.table[i][j], animateArgs);
			}
    }
    
    await this.wasteTime(0.5);
    this.table = [];
	}

	async renderHands(handSort = 'ranks', animation = 'fast', hands = 'all') {
    // sort hand by 'ranks' or 'suits'. animation options 'fast' or 'cool'. render hands 'all' or 'you' only.
		const animateArgs = { x: null, y: null, delay: null, duration: 500, ease: 'quartOut', };
    
		// sort by rank or suit
		if (handSort === 'ranks') {
			this.you.hand = this.you.hand.sort((a, b) => (a.big2rank - b.big2rank));
			if (hands === 'all') this.AI.hand = this.AI.hand.sort((a, b) => (a.big2rank - b.big2rank));
		} else if (handSort === 'suits') {
			let youNewHand = [];
			let AINewHand = [];
			[3, 2, 1, 0].forEach(suit => {
				youNewHand = youNewHand.concat(this.you.hand.sort((a, b) => (b.suit - a.suit)).filter(card => card.suit === suit).sort((a, b) => (a.big2rank - b.big2rank)));
				if (hands === 'all') AINewHand = AINewHand.concat(this.AI.hand.sort((a, b) => (b.suit - a.suit)).filter(card => card.suit === suit).sort((a, b) => (a.big2rank - b.big2rank)));
			});
			this.you.hand = youNewHand;
			if (hands === 'all') this.AI.hand = AINewHand;
		}
    
		// animate
		for (let i = 0; i < 18; i++) {
			[this.you.hand, hands === 'all' ? this.AI.hand : []].forEach(hand => {
				if (hand[i]) {
					animateArgs.x = window.innerWidth * -0.4 + 15 * i;
					animateArgs.y = hand[i].y;
          if (animation === 'cool') animateArgs.delay = i * 20;
					this.asyncAnimate(hand[i], animateArgs);
					hand[i].$el.style.zIndex = i;
				}
			});
    }

    await this.wasteTime(0.5);
	}

	async renderTable(fast = true) {
		const animateArgs = { x: null, y: 0, delay: null, duration: 500, ease: 'quartOut', };

		// add everything to the table 
		for (let i = 0; i < this.table.length; i++) {
			for (let j = 0; j < this.table[i].length; j++) {
        animateArgs.x = window.innerWidth * -0.4 + 15 * j + 155 * i;
        animateArgs.delay = j * (fast ? 20 : 10);
				this.asyncAnimate(this.table[i][j], animateArgs);
				this.table[i][j].setSide('front');
			}
    }

    await this.wasteTime(0.5);
    await this.clearOldHands();
	}

	async clearOldHands() {
		// all hands except most recently played 2 hands fall off table
    const animateArgs = { x: window.innerWidth * -0.7, y: 0, delay: null, duration: 500, ease: 'quartOut', };

		if (this.table.length === 3) {
			for (let i = 0; i < this.table[0].length; i++) {
        animateArgs.delay = i * 20;
        this.asyncAnimate(this.table[0][i], animateArgs);
        if (i === this.table[0].length - 1) {
          this.table = this.table.slice(1);
          await this.wasteTime(0.5);
          await this.renderTable();
        }
			}
    }
	};	

  async AIturn() {
    const AIwillPlay = this.AIalgorithms.selectBestHandToPlay.call(this,
      this.AI.hand,
      this.parseHand(this.table.length === 2
        ? this.table[1].map(card => card.big2rank)
        : (this.table.length === 1 ? this.table[0].map(card => card.big2rank) : [0])),
      this.you.hand.length
    );
    if (!AIwillPlay.length) {
			console.log('AI passed. ');
      await this.wipeTable();
    } else {
      console.log('AI HAND HOLDS THIS RANKS: ', this.AI.hand.map(card => card.big2rank));
      this.AI.hand.filter(card => AIwillPlay.includes(card.big2rank)).forEach(async(card) => await card.activate('AI'));
      console.log('AI hand activated these many cards: ', this.AI.hand.filter(card => card.active).length);
      await this.wasteTime(0.5); // cool visual effect
      await this.playActiveCards(this.AI);
      await this.renderTable();
      await this.renderHands();
      if (this.AI.hand.length === 0) this.scorePoints('AI'); // check win
    }
  }

	scorePoints(playerName) {
		const elementId = playerName === 'you' ? 'your-score' : 'ai-score';
		document.getElementById(elementId).innerHTML = 
			~~document.getElementById(elementId).innerHTML +
			(playerName === 'you' ? this.AI.hand.length : this.you.hand.length) *
			Math.pow(2, (this.table.length ? this.table[this.table.length - 1] : []).filter(card => card.rank === 2).length);
		if (~~document.getElementById(elementId).innerHTML >= 49) {
			document.getElementById('message').innerHTML = playerName === 'you' ? 'You Win!' : 'AI Wins!';
			this.gameActive = false;
			return;
		}

		this.deck.unmount(this.$container);
		window.game = new Big2Game();
	}

	async initGame() {
		const animateArgs = { x: null, y: null, delay: null, duration: 500, ease: 'quartOut', };
		// declare key events
		document.onkeyup = async(e) => {
			if (this.gameActive) {
				if (e.keyCode === 13) { // enter
          this.gameActive = false;
          const originalHandSize = this.you.hand.length;
          await this.playActiveCards(this.you);
          if (originalHandSize === this.you.hand.length) { // play invalid cards = stop sequence
            this.gameActive = true;
            return;
          }
          await this.renderTable();
          await this.renderHands();
          if (this.you.hand.length === 0) { // check win
            this.scorePoints('you');
          } else {
            await this.AIturn();
            console.log('AI finished turn');
            this.gameActive = true;
          }
				} else if (e.keyCode === 80) { // p
          this.you.hand.filter(card => card.active).forEach((card) => card.activate('you'));
          this.gameActive = false;
          await this.wipeTable();
          await this.AIturn();
          console.log('AI finished turn');
          this.gameActive = true;
        } else if (e.keyCode === 83) { // s
          this.gameActive = false;
					this.handSort = this.handSort === 'ranks' ? 'suits' : 'ranks';
          await this.renderHands(this.handSort, 'cool', 'you');
          this.gameActive = true;
				} else if (e.keyCode === 84) { // t
					this.AI.hand.forEach(card => card.setSide(card.side === 'front' ? 'back' : 'front'));
				}
			}
		};

		this.deck.mount(this.$container); // add to DOM

		// deal cards
		this.deck.shuffle();
		for (let i = 0; i < this.deck.cards.length; i++) {
			if (i >= 36) {
				// extra cards exit the screen
				animateArgs.x = this.deck.cards[i].x;
				animateArgs.y = window.innerHeight * -0.7;
				animateArgs.delay = 1000 + i * 20;
			} else if (i >= 18 && i < 36) {
				this.AI.hand.push(this.deck.cards[i]);
				animateArgs.x = window.innerWidth * -0.4 + 15 * (i - 18);
				animateArgs.y = window.innerHeight * -0.3;
				animateArgs.delay = 1000 + i * 20;
			} else if (i >= 0 && i < 18) {
				this.you.hand.push(this.deck.cards[i]);
				this.deck.cards[i].setSide('front');
				animateArgs.x = window.innerWidth * -0.4 + 15 * i;
				animateArgs.y = window.innerHeight * 0.3;
				animateArgs.delay = 1000 + i * 20;
			}
      this.asyncAnimate(this.deck.cards[i], animateArgs);
    }
    
    // modify each card object in this.deck to have Big-2-relevant properties
    // properties are added instead of subclassing for simplicity...the deck_of_cards _card class is already great
		animateArgs.delay = 0;
		animateArgs.duration = 100;

		this.deck.cards.forEach(card => {
			// create Big-2 specific ranks. (3 - card.suit) is suit power. they are x10 to avoid floating point arithmetic errors.
			card.big2rankWithoutSuit = card.rank === 1 ? 140 : (card.rank === 2 ? 150 : card.rank * 10);
			card.big2rank = card.big2rankWithoutSuit + (3 - card.suit);
			if (card.suit === 0) card.unicodeSuit = '♠'; // unicode suits for prettiness (only used in console)
			if (card.suit === 1) card.unicodeSuit = '♥';
			if (card.suit === 2) card.unicodeSuit = '♣';
			if (card.suit === 3) card.unicodeSuit = '♦';
			card.active = false; // tracks whether a card in your hand is active i.e. 'popped out'
			card.activate = async(playerName) => {
				card.active = !card.active;
				animateArgs.x = card.x;
				animateArgs.y = card.y + (card.active ? 20 : -20) * (playerName === 'you' ? -1 : 1);
        await this.asyncAnimate(card, animateArgs);
			};
			card.$el.onclick = async() => { // click a card to prepare it for play
				if (this.gameActive && this.you.hand.map(card => card.big2rank).includes(card.big2rank)) await card.activate('you');
			};
    });	

    await this.wasteTime(3);
    await this.renderHands(this.handSort);
    this.gameActive = true;
    return;
  }
};
