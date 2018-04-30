export default class Big2Hand {
  constructor(cards = []) {
    this.cards = cards;
  }

  has(card) {
    return this.cards.map(item => item.big2rank).includes(card.big2rank);
  }

  add(card) {
    this.cards.push(card);
  }

  big2Ranks(filter_cb = () => true) {
    return this.cards.filter(filter_cb).map(item => item.big2rank);
  }

  activate(big2ranks) {
    this.cards.forEach(card => {
      if (big2ranks.includes(card.big2rank)) card.activate();
    });
  }

  playActiveCards() {
    const ret = [];
    for (let i = 0; i < this.cards.length; i++) {
      // if (true) { // play all cards, for development
      if (this.cards[i].active) {
        this.cards[i].active = false;
        ret.push(this.cards.splice(i--, 1)[0]);
      }
    }
    return ret;
  }

  deactivateAllCards() {
    this.cards.forEach(card => {
      if (card.active) card.activate();
    });
  }

  fadeOut() {
    this.cards.forEach(card => {
      card.$el.style.opacity = 0;
    });
    this.cards = [];
  }

  render(destination = null, delay = 0) {
    this.cards.sort((a, b) => a.big2rank - b.big2rank);
    this.cards.forEach((card, index) => {
      card.$el.style.zIndex = index;
      card.animate(destination || card.location, 400, index - ~~(this.cards.length / 2), delay);
    });
  }
}
