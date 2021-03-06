import * as server from './httpClient';
import shortid from 'shortid';

import Big2Hand from './Big2Hand';

export default class Big2Game {
  constructor(container, game, you) {
    // create the deck, initialize properties relevant to Big 2, and mount it to the container HTML element
    this.$container = container;
    this.deck = null;
    this.initDeckPropertiesAndMount();

    // game variables
    this.gameId = game.id;
    this.player1 = game.players[0]; this.player2 = game.players[1]; // assign entire player object to long variable
    this.p1 = this.player1.id; this.p2 = this.player2.id; // assign id to short variable for easy hand referencing
    this.you = you; // your player id
    this.gameActive = false; // whether you can make a move (e.g. can't make a move during opponent's turn)
    this.spectating = this.p1 !== you && this.p2 !== you; // is this client a spectator?
    this.gameover = false; // used to terminate ai scripts
    this.hands = {
      [this.p1]: null,
      [this.p2]: null,
    };
    this.table = null;

    // initalize games with given player hands and table state
    this.initGame(game.p1Hand, game.p2Hand, game.table, game.activeCards);
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
      gameId: this.gameId,
      player,
      action,
      cards,
    };

    return await server.post('sendInstruction', instruction);
  }

  async readInstruction(instruction) {
    const { player, action, cards } = instruction;

    if (action === 'playActiveCards') {
      if (this.table.cards.length) this.table.fadeOut();
      this.table = new Big2Hand(this.hands[player].playActiveCards());
      this.table.render('table');
      this.table.faceUp();
      this.hands[player].render();
      if (!this.hands[this.p1].cards.length) {
        this.gameover = true;
        await this.newInstruction('p1Wins');
      } else if (!this.hands[this.p2].cards.length) {
        this.gameover = true;
        await this.newInstruction('p2Wins');
      }
      if (!this.gameId.startsWith('AIvAI_') && player !== this.you) this.gameActive = true;
    } else if (action === 'activate') {
      this.hands[player].activate(cards);
    } else if (action === 'deactivateAllCards') {
      this.hands[player].deactivateAllCards();
    } else if (action === 'pass') {
      this.hands[player].deactivateAllCards();
      this.table.fadeOut();
      if (player !== this.you) this.gameActive = true;
    }
  }

  async aiTurn(player) {
    if (this.gameId.startsWith('1vAI_') || this.gameId.startsWith('AIvAI_')) {
      await this.wait(1000);
      const state = {
        hand: this.hands[player].big2Ranks(),
        table: this.table.big2Ranks(),
        opponentCards: this.hands[player.id === this.p2.id ? this.p1 : this.p2].big2Ranks(),
        aggression: 2
      };
      const bestHandToPlay = await server.post('selectBestHandToPlay', state);
      await this.newInstruction('activate', bestHandToPlay, player);
      await this.wait(500);
      await this.newInstruction('playActiveCards', null, player);
      this.gameActive = true;
      return null;
    }
  }

  async startAI() {
    // make AI play against each other, or make it P1's turn
    while (!this.gameover) {
      await this.aiTurn(this.p1);
      if (this.gameover) break;
      await this.aiTurn(this.p2);
    }
  }

  initDeckPropertiesAndMount() {
    // unmount all cards in old deck, create new deck, and mount new deck
    if (this.deck) { // i'm not sure whether unmounting is actually required...
      this.deck.cards.forEach(card => {
        card.unmount();
      });
    }
    this.deck = window.Deck(); // console.log('Deck: ', this.deck);
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
      card.animate = (destination, x = card.x, offset = 0, delay = 0, instant = false) => {
        if (destination !== 'activate') card.location = destination;
        const animateArgs = {
          x: x + offset * 15,
          delay: instant ? 0 : (delay + 20 * offset),
          duration: instant ? 0 : 500,
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
        if (!this.spectating) await this.newInstruction('activate', [card.big2rank]);
      };
    });
  }

  initGame(p1Hand, p2Hand, table, activeCards) {
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

          if (await server.post('validPlay', play)) {
            await this.newInstruction('playActiveCards');
            this.aiTurn(this.p2);
          } else {
            await this.newInstruction('deactivateAllCards');
            this.gameActive = true;
          }
        } else if (e.keyCode === 80) {
          this.gameActive = false;
          await this.newInstruction('pass')
          this.aiTurn(this.p2);
        }
      } else {
        // deactivate all cards if you try to play something not on your turn
        if (e.keyCode === 13 || e.keyCode === 80) await this.newInstruction('deactivateAllCards');
      }
    };

    // initialize hands and table
    this.hands = {
      [this.p1]: new Big2Hand(this.deck.cards.filter(card => p1Hand.includes(card.big2rank))),
      [this.p2]: new Big2Hand(this.deck.cards.filter(card => p2Hand.includes(card.big2rank))),
    };
    this.table = new Big2Hand(this.deck.cards.filter(card => table.includes(card.big2rank)));
    
    // move all cards to center of table to prepare for dealing
    this.deck.cards.forEach((card, index) => {
      card.setSide('back');
      card.animate('table', 400, 0, 0, this.spectating);
    });

    // deal the cards
    this.hands[this.p1].render(this.p1 === this.you || this.spectating ? 'bottom' : 'top', 1000, this.spectating);
    this.hands[this.p2].render(this.p2 === this.you ? 'bottom' : 'top', 1000, this.spectating);
    this.table.render('table', 1000, this.spectating);

    // turn dealt cards face-up, and move rest of cards to trash
    this.table.faceUp();
    if (this.spectating) {
      this.hands[this.p1].faceUp();
    } else {
      this.hands[this.you].faceUp();
    }
    this.deck.cards.forEach((card, index) => {
      if (this.hands[this.p1].has(card) || this.hands[this.p2].has(card) || this.table.has(card)) {
        if (this.gameId.startsWith('AIvAI_')) {
          card.setSide('front');
        }
      } else {
        card.animate('trash', card.x, index, 1000, this.spectating);
      }
    });

    if (this.spectating) {
      setTimeout(() => {
        // activate all cards that were activated already
        this.hands[this.p1].activate(activeCards);
        this.hands[this.p2].activate(activeCards);
        // conditionally start AIvAI_ gameplay
        if (this.gameId.startsWith('AIvAI_')) {
          // only works for one spectator currently
          this.gameover = false;
          this.startAI();
        }
      }, 500);
    } else {
      // make it p1's turn
      if (this.p1 === this.you) this.gameActive = true;
    }
  }
}
