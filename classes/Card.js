// const lands = ["heart", "diamond", "club", "spade"];
const lands = ["S", "C", "H", "D"];
const landUnicodes = ["♠", "♣", "♥", "♦"];
const numbers = ["A",2,3,4,5,6,7,8,9,10,"J","Q","K"];
const colors = {
    black:"black",
    red:"red"
};
const landNos = [1,2,4,8];
const imageFormat = '.png'; 
class Card {
    constructor(landId, numberId){
        this.number = numbers[numberId].toString();
        this.land = lands[landId];
        this.color = landId > 2 ? colors.red : colors.black;
        this.id = this.number+this.land
        this.selected = false;
        this.image = this.id+imageFormat;
        this.value = numberId === 0 ? 14 : (numberId + 1);
        this.enabled = true;
        this.landNo = landNos[landId];
        this.landIcon = landUnicodes[landId];
        this.cardNo = this.getCardNo()
    }

    getCard(){
        return {
            number:this.number,
            color:this.color,
            id:this.id,
            selected:this.selected,
            land:this.land,
            enabled:this.enabled,
            cardNo:this.cardNo
        }
    }

    getCardNo(){
        return `${this.number.replace('10', 'T')}${this.land.toLowerCase()}`
    }

    toggleSelected(){
        this.selected = !this.selected;
    }

    enableCard(){
        this.enabled = true;
    }

    disableCard(){
        this.enabled = false;
    }
}

module.exports = Card;