import Game from './Game'

export default class Mustamaija extends Game {
    constructor(id, name, players, config){
        super(id, name, players, config);
        this.gameType = "mustamaija";
        this.playersAmount = config.playersAmount;
        this.turn = players[0];
        this.cards = [];
        this.table = [];
        this.tableLand = null;
        this.trash = [];
        this.landCard = null;
        this.shuffleDeck();
        this.setLandCard();
    }

    getSelf(){
        return {
            id:this.id,
            name:this.name,
            type:this.type,
            gameType:this.gameType,
            trash:this.trash,
            cards:this.cards,
            table:this.table,
            tableLand:this.tableLand,
            landCard:this.landCard,
            players:this.formatPlayers(),
            turn:this.turn.getSelf()
        }
    }

    clickCard(cardObj){
        const card = this.turn.findCard(cardObj);
        card.selected = !card.selected;
            this.checkEnabledCards(card);
            if(this.table.length > 0 && this.turn.cards.filter(c => c.selected).length === 1){
                this.checkEnabledTable(card);
            }else{
                this.table.map(c => c.enabled = true);
                this.checkEnabledCards(card);
            }

        

        this.turn.emitGame();
    }

    checkEnabledTable(card){
        console.log('it1')
        this.table.map(c => {
            if(card.land === c.land && card.rank > c.rank){
                c.enabled = true;
            }else{
                c.enabled = false;
            }
        })
    }

    checkEnabledCards(card){
        console.log('it2')
        let cards = this.turn.cards;
        let selectedCards = this.turn.cards.filter(c => c.selected);
        if(this.table.length === 0 && selectedCards.length === 0){
            this.turn.enableCards()
        }else{
            this.turn.cards.map(c => c.disableCard());
            if(card){
                this.turn.cards.filter(c => c.land === card.land).map(c => c.enableCard())
            }

        }
    }

    changeCards(cards){
        cards.map(card => {
            this.table.push(card);
            this.tableLand = card.land;
            this.turn.giveCard(card);
            this.turn.receiveCard(this.giveCard())
        })
        this.turn.cards.map(c => c.disableCard())
        this.turn.cards.filter(c => c.land === this.tableLand || c.land === this.landCard.land).map(c => c.enableCard());
        this.turn.broadcastGame();
    }

    setLandCard(){
        this.landCard = this.cards.filter(c => c.land !== "S")[0];
    }

    trashTable(){
    }

    receiveCard(card){
    }

    finishGame(winner){
    }

    setNextTurn(){

    }

    moveBot(bot){
    }

    giveTable(player){
    }
    
    revealHands(){
    }

    hideHands(){
    }


    setLand(land){
    }

    setLeader(playerId, card){
    }

    getWinner(){
    }

    resetGame(){
    }

}