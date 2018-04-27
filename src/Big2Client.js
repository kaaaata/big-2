import * as functions from './functions';
import shortid from 'shortid';

import Big2Hand from './Big2Hand';

export default class Big2Game {
  constructor(container, players, player, game_id) {
    // HTML and CSS definitions
    this.$container = container;

    // variables
    this.p1 = players[0]; this.p2 = players[1];
    this.hands = { [this.p1.id]: new Big2Hand(), [this.p2.id]: new Big2Hand() };
    this.table = [];
    this.you = player.id;
    this.deck = window.Deck(); console.log('Deck: ', this.deck);
    this.gameActive = false;
    this.game_id = game_id;
    
    this.initGame.call(this);
  };

  renderTable() {
    for (let i = 0; i < this.table.length; i++) {
      for (let j = 0; j < this.table[i].cards.length; j++) {
        if (i === 0) this.table[i].cards[j].animate('table', 400, j - ~~(this.table[i].cards.length / 2));
        if (i !== 0) this.table[i].cards[j].$el.style.opacity = 0;
      }
    }
  }

  async newInstruction(action, cards = null) {
    const instruction = {
      id: shortid.generate(),
      game_id: this.game_id,
      player: this.you,
      action,
      cards,
    };
    await functions.post('sendInstruction', instruction);
  }

  readInstruction(instruction) {
    const { player, action, cards } = instruction;

    if (action === 'playActiveCards') {
      this.table.unshift(new Big2Hand(this.hands[player].playActiveCards()));
      this.renderTable();
      this.hands[player].render();
    } else if (action === 'activate') {
      this.hands[player].activate(cards);
    } else if (action === 'pass') {
      this.hands[player].deactivateAllCards();
      if (player !== player.you) this.gameActive = true;
    }
  }

  initGame() {
    document.onkeyup = async(e) => {
			if (this.gameActive) {
        if (e.keyCode === 13) { // enter
          
          // this.gameActive = false;
          await this.newInstruction('playActiveCards');
        } else if (e.keyCode === 80) {
          // this.gameActive = false;
          await this.newInstruction('pass')
        }
      }
    };
    
    this.deck.cards.forEach(card => {
			// create Big-2 specific ranks. (3 - card.suit) is suit power. they are x10 to avoid floating point arithmetic errors.
			card.big2rankWithoutSuit = card.rank === 1 ? 140 : (card.rank === 2 ? 150 : card.rank * 10);
			card.big2rank = card.big2rankWithoutSuit + (3 - card.suit);
      card.active = false; // tracks whether a card in your hand is active i.e. 'popped out'
      card.location = null;
      card.x = 400;
      card.y = 300;
      card.$el.style.transition = 'opacity 0.25s ease-out';
      card.animate = (destination, x = card.x, offset = 0, delay = 0) => {
        if (destination !== 'activate') card.location = destination;
        const animateArgs = {
          x: x + offset * 15,
          delay: delay + 20 * offset,
          duration: 500,
          ease: 'quartOut',
        };
        if (destination === 'top') {
          animateArgs.y = 50;
        } else if (destination === 'table') {
          animateArgs.y = 300;
        } else if (destination === 'bottom') {
          animateArgs.y = 550;
        } else if (destination === 'trash') {
          animateArgs.y = -200;
        } else if (destination === 'activate') {
          if (card.location === 'top') {
            animateArgs.y = card.active ? 50 : 70;
          } else if (card.location === 'bottom') {
            animateArgs.y = card.active ? 550 : 530;
          }
          animateArgs.duration = 250;
          card.active = !card.active;
        }
        card.animateTo(animateArgs);
      };
      card.activate = () => card.animate('activate');
      card.$el.onclick = async() => {
        const instruction = {
          id: shortid.generate(),
          player: this.you,
          action: 'activate',
          cards: [card.big2rank],
          game_id: this.game_id,
        };
        await functions.post('sendInstruction', instruction);
      };
    });	
    this.deck.mount(this.$container);
    this.deck.shuffle();
    for (let i = 0; i < this.deck.cards.length; i++) {
			if (i >= 36) {
        // extra cards exit the screen
        this.deck.cards[i].animate('trash', this.deck.cards[i].x, i, 1000);
			} else if (i >= 18 && i < 36) {
        this.hands[this.p2.id].add(this.deck.cards[i]);
        this.deck.cards[i].setSide('front');
				this.deck.cards[i].animate('top', this.deck.cards[i].x, (i - 18) - 9, 1000);
			} else if (i >= 0 && i < 18) {
				this.hands[this.p1.id].add(this.deck.cards[i]);
				this.deck.cards[i].setSide('front');
				this.deck.cards[i].animate('bottom', this.deck.cards[i].x, i - 9, 1000);
			}
    }
    this.gameActive = true;
  }
}
