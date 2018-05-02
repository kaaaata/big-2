import * as django from './serverWrappers';
import shortid from 'shortid';

import Big2Hand from './Big2Hand';

export default class Big2Game {
  constructor(container, game, you) {
    // create the deck, initialize properties relevant to Big 2, and mount it to the container HTML element
    this.$container = container;
    this.deck = null;
    this.initDeckPropertiesAndMount();

    // game variables
    this.game_id = game.id;
    this.player1 = game.players[0]; this.player2 = game.players[1]; // assign entire player object to long variable
    this.p1 = this.player1.id; this.p2 = this.player2.id; // assign id to short variable for easy hand referencing
    this.you = you; // your player id
    this.gameActive = false; // whether you can make a move (e.g. can't make a move during opponent's turn)
    this.hands = {
      [this.p1]: null,
      [this.p2]: null,
    };
    this.table = null;

    // initalize games with given player hands and table state
    this.initGame(game.p1_hand, game.p2_hand, game.table);
  };

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async newInstruction(action, cards = null, player = this.you) {
    const instruction = {
      id: shortid.generate(),
      game_id: this.game_id,
      player,
      action,
      cards,
    };

    await django.post('sendInstruction', instruction);
  }

  async readInstruction(instruction) {
    const { player, action, cards } = instruction;

    if (action === 'playActiveCards') {
      if (this.table.cards.length) this.table.fadeOut();
      this.table = new Big2Hand(this.hands[player].playActiveCards());
      this.table.render('table');
      this.hands[player].render();
      // check win, otherwise proceed with gameplay
      if (!this.hands[this.p1].cards.length) {
        setTimeout(async() => await this.newInstruction('p1 wins'), 1000);
      } else if (!this.hands[this.p2].cards.length) {
        setTimeout(async() => await this.newInstruction('p2 wins'), 1000);
      } else {
        if (player !== this.you) this.gameActive = true;
      }
    } else if (action === 'activate') {
      this.hands[player].activate(cards);
    } else if (action === 'deactivateAllCards') {
      this.hands[player].deactivateAllCards();
    } else if (action === 'pass') {
      this.hands[player].deactivateAllCards();
      this.table.fadeOut();
      if (player !== this.you) this.gameActive = true;
    } else if (action === 'new game') {
      setTimeout(() => {
        this.initDeckPropertiesAndMount();
        this.initGame(cards.p1_hand, cards.p2_hand, cards.table);
      }, 2000);
    }
  }

  aiTurn() {
    if (this.game_id.startsWith('HUMAN_VS_AI')) {
      setTimeout(async() => {
        const state = {
          hand: JSON.stringify(this.hands[this.p2].big2Ranks()),
          table: JSON.stringify(this.table.big2Ranks()),
          opponentCards: this.hands[this.p1].cards.length,
          aggression: 2,
        };
        const bestHandToPlay = await django.get('selectBestHandToPlay', state);
        await this.newInstruction('activate', bestHandToPlay, this.p2);
        await this.wait(500);
        await this.newInstruction('playActiveCards', null, this.p2);
        this.gameActive = true;
      }, 1000);
    }
  }

  initDeckPropertiesAndMount() {
    // unmount all cards in old deck, create new deck, and mount new deck
    if (this.deck) { // i'm not sure whether unmounting is actually required...
      this.deck.cards.forEach(card => {
        card.unmount();
      });
    }
    this.deck = window.Deck(); console.log('Deck: ', this.deck);
    this.deck.mount(this.$container);

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
          animateArgs.y = 75;
        } else if (destination === 'table') {
          animateArgs.y = 300;
        } else if (destination === 'bottom') {
          animateArgs.y = 525;
        } else if (destination === 'trash') {
          animateArgs.y = -200;
        } else if (destination === 'activate') {
          if (card.location === 'top') {
            animateArgs.y = card.active ? 75 : 95;
          } else if (card.location === 'bottom') {
            animateArgs.y = card.active ? 525 : 505;
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
        await django.post('sendInstruction', instruction);
      };
    });
  }

  initGame(p1_hand, p2_hand, table) {
    // set keyboard events
    document.onkeyup = async(e) => {
			if (this.gameActive) {
        if (e.keyCode === 13) { // enter
          // if you have no cards active, do nothing
          if (!this.hands[this.you].big2Ranks((card => card.active)).length) return;
          this.gameActive = false;
          const play = {
            cards: this.hands[this.you].big2Ranks((card) => card.active),
            table: this.table.cards.length > 0 ? this.table.big2Ranks() : null,
          };

          if (await django.post('validPlay', play)) {
            await this.newInstruction('playActiveCards');
            this.aiTurn();
          } else {
            await this.newInstruction('deactivateAllCards');
            this.gameActive = true;
          }
        } else if (e.keyCode === 80) {
          this.gameActive = false;
          await this.newInstruction('pass')
          this.aiTurn();
        }
      } else {
        // deactivate all cards if you try to play something not on your turn
        if (e.keyCode === 13 || e.keyCode === 80) await this.newInstruction('deactivateAllCards');
      }
    };

    // initialize hands and table
    this.hands = {
      [this.p1]: new Big2Hand(this.deck.cards.filter(card => p1_hand.includes(card.big2rank))),
      [this.p2]: new Big2Hand(this.deck.cards.filter(card => p2_hand.includes(card.big2rank))),
    };
    this.table = new Big2Hand(this.deck.cards.filter(card => table.includes(card.big2rank)));
    
    // move all cards to center of table to prepare for dealing
    this.deck.cards.forEach((card, index) => {
      card.setSide('back');
      card.animate('table', 400, 0, 0);
    });

    // deal the cards
    this.hands[this.p1].render(this.p1 === this.you ? 'bottom' : 'top', 1000);
    this.hands[this.p2].render(this.p2 === this.you ? 'bottom' : 'top', 1000);
    this.table.render('table', 1000);

    // turn dealt cards face-up, and move rest of cards to trash
    this.deck.cards.forEach((card, index) => {
      if (this.table.has(card) || this.hands[this.p1].has(card) || this.hands[this.p2].has(card)) {
        card.setSide('front');
      } else {
        card.animate('trash', card.x, index, 1000);
      }
    });

    // make it P1's turn
    if (this.p1 === this.you) this.gameActive = true;
  }
}
