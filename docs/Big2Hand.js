// in progress...
// this class is not necessary, but it would greatly simplify things if each hand were its own class instance.

class Big2Hand extends Big2Logic {
    constructor(hand) {
        // take hand like [{}, {}] and generate relevant properties/methods
        this.hand = hand;
        this.combo;
        this.power; 

        this.init.call(this);
    }

    init() {
      const parsedHand = this.parsedHand(this.hand.map(card => card.big2value));
      this.combo = parsedHand.combo;
      this.power = parsedHand.power;
    }

}
