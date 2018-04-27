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

  activeBig2Ranks() {
    return this.cards.filter(item => item.active).map(item => item.big2rank);
  }

  activate(big2ranks) {
    this.cards.forEach(card => {
      if (big2ranks.includes(card.big2rank)) card.activate();
    });
  }

  playActiveCards() {
    const ret = [];
    this.cards.forEach((card, index) => {
      if (card.active) {
        card.active = false;
        ret.push(this.cards.splice(index, 1)[0]);
      }
    });
    return ret;
  }

  deactivateAllCards() {
    this.cards.forEach(card => {
      if (card.active) card.activate();
    });
  }

  render() {
    this.cards.forEach((card, index) => {
      card.animate(card.location, 400, index - ~~(this.cards.length / 2));
    });
  }
}