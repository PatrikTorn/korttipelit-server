import Game from './Game';

export default class Paskahousu extends Game {
    constructor(id, name, players, config){
        super(id, name, players, config);
        this.gameType = "paskahousu";
        this.playersAmount = config.playersAmount;
        this.turn = players[0].id;
        this.cards = [];
        this.table = [];
        this.trash = [];
        this.firstTableCard = null;
        this.shuffleDeck();
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
            firstTableCard:this.firstTableCard && this.firstTableCard,
            players:this.formatPlayers(),
            turn:this.turn
        }
    }

    trashTable(){
        this.trash = [...this.trash, ...this.table];
        this.table = [];
        this.firstTableCard = null;
    }

    receiveCard(card){
        this.table.push(card);
        this.firstTableCard = card;
    }

    finishGame(winner){
        this.players.map(player =>{ player.cards = [];});
        this.cards = [];
        this.table = [];
        this.trash = [];
        this.firstTableCard = null;
        winner.points += 2;
        this.shuffleDeck();
        this.deal();
        this.broadcastGame();
    }

    setNextTurn(){
        const nowPlayer = this.findPlayer({id:this.turn});
        if(nowPlayer.cards.length === 0){
            return this.finishGame(nowPlayer);
        }
        nowPlayer.cardTaken = false;
        this.turn = this.getNextPlayer();
        const nextPlayer = this.findPlayer({id:this.turn});
        if(this.firstTableCard) nextPlayer.PH_checkHandAgainstTable()
        else nextPlayer.enableCards()
        // if(nextPlayer.cards.every(c => !c.enabled)){
            // this.giveTable(nextPlayer);
            // nextPlayer.enableCards();
        // }
        this.broadcastGame();
        if(nextPlayer.type === "bot"){
            this.moveBot(nextPlayer);
        }
    }

    moveBot(bot){
        setTimeout(() => {
            const allowedCards = bot.cards.filter(c => c.enabled);
            if(allowedCards.length > 0){
                bot.PH_clickCard(allowedCards[0]);
                // console.log("clicked once", bot.cards)
                if(bot.cards.filter(c => c.selected).length > 0){
                    console.log("Now here");
                    // console.log(bot.cards);
                    console.log(bot.cards.filter(c => c.enabled))
                    console.log(bot.cards.filter(c => c.enabled).filter(c => !c.selected)[0])
                    while(bot.cards.filter(c => c.enabled).every(c => c.selected === true)){
                        bot.PH_clickCard(bot.cards.filter(c => c.enabled).filter(c => !c.selected)[0]);
                        console.log("Iterated");
                    }
                    const selectedCards = bot.cards.filter(c => c.selected);
                    console.log(selectedCards, 'selected');
                    // console.log(selectedCards);
                    bot.PH_changeCards(selectedCards);
                }
            }else{
                this.giveTable(bot);
            }
        }, 2000)

    }

    giveTable(player){
        player.cards = [...this.table, ...player.cards];
        player.enableCards();
        this.table = [];
        this.firstTableCard = null;
        this.setNextTurn();
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
