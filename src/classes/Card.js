// const lands = ["heart", "diamond", "club", "spade"];
const lands = ["S", "C", "H", "D"];
const landUnicodes = ["♠", "♣", "♥", "♦"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const colors = {
  black: "black",
  red: "red",
};
const imageFormat = ".png";

export default class Card {
  constructor(landId, rank) {
    this.landId = landId;
    this.rank = rank;
    this.value = values[rank];
    this.land = lands[landId];
    this.color = landId > 2 ? colors.red : colors.black;
    this.id = this.value + this.land;
    this.selected = false;
    this.image = this.id + imageFormat;
    this.enabled = true;
    this.landIcon = landUnicodes[landId];
    this.cardNo = this.getCardNo();
  }

  getCard() {
    return {
      landId: this.landId,
      rank: this.rank,
      color: this.color,
      id: this.id,
      selected: this.selected,
      land: this.land,
      enabled: this.enabled,
      cardNo: this.cardNo,
    };
  }

  getCardNo() {
    const cardNo = `${this.value.replace("10", "T")}${this.land.toLowerCase()}`;
    return cardNo.replace("2s", "Or").replace("2c", "Or");
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  enableCard() {
    this.enabled = true;
  }

  disableCard() {
    this.enabled = false;
  }
}
