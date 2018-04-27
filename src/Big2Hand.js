export default class Big2Hand {
  constructor(cards = []) {
    this.cards = cards;
  }

  has(card) {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].big2rank === card.big2rank) return true;
    }
    return false;
  }

  add(card) {
    this.cards.push(card);
  }

  activate(big2ranks) {
    for (let i = 0; i < this.cards.length; i++) {
      if (big2ranks.includes(this.cards[i].big2rank)) this.cards[i].activate();
    }
  }

  playActiveCards() {
    const ret = [];
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].active) {
        this.cards[i].active = false;
        ret.push(this.cards.splice(i, 1)[0]);
      }
    }
    return ret;
  }

  deactivateAllCards() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].active) this.cards[i].activate();
    }
  }

  render() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].animate(this.cards[i].location, 400, i - ~~(this.cards.length / 2));
    }
  }
}