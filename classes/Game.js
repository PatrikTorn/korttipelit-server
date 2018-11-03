const Room = require('./Room');
const Card = require('./Card');
const {rankPokerHand} = require('../common');

class Game extends Room {
    constructor(name, players, playersAmount){
        super(name, players, playersAmount);
        this.playersAmount = playersAmount;
        this.deck = [];
        this.trash = [];
        this.cards = [];
        this.turn = Object.keys(players)[0];
        this.round = 0;
        this.shuffleDeck();
        this.land = null;
        this.leader = {
            playerId:null,
            cardValue:null
        }
        this.revealHand = false;
    }

    getRoom(){
        return {
            name:this.name,
            deck:this.deck,
            trash:this.trash,
            cards:this.cards,
            players:this.formatPlayers(),
            turn:this.turn,
            round:this.round,
            land:this.land,
            revealHand:this.revealHand
        }
    }

    toggleRevealHand(){
        this.revealHand = !this.revealHand;
    }

    findCard(card){
        return this.cards.find(c => c.id === card.id);
    }

    deleteCard(card){
        this.cards = this.cards.filter(c => c.id !== card.id);
    }

    setLand(land){
        this.land = land;
        for(let player in this.players){
            this.players[player].checkEnabledCards(land);
        }
    }

    setLeader(playerId, card){
        if(this.leader.playerId){
            if(card.value > this.leader.cardValue && card.land === this.land){
                this.leader = {
                    playerId,
                    cardValue:card.value
                }
            }
        }else{
            this.leader = {
                playerId,
                cardValue:card.value
            }
        }
    }

    getNextPlayer(){
        const playerId = this.turn;
        const thisPlayers = Object.keys(this.players);
        const thisIndex = thisPlayers.indexOf(playerId);
        if(playerId === thisPlayers[thisPlayers.length - 1]){
            return thisPlayers[0];
        }else{
            return thisPlayers[thisIndex + 1];
        }
    }


    getWinner(){
        const thisPlayers = Object.values(this.players);
        const tikkiWinner = this.players[this.leader.playerId];

        let tikkiPoints;
        if(this.leader.cardValue === 1) tikkiPoints = 4;
        else tikkiPoints = 2;
        tikkiWinner.addPoints(tikkiPoints)

        const allPoints = thisPlayers.map(player => player.hand.points);
        const bestPoints = Math.max(...allPoints);
        const pokerWinners = thisPlayers
            .filter(player => player.hand.points === bestPoints)
            .map(player => {player.addPoints(player.hand.points); return player.getSocket()});
        this.toggleRevealHand();
        tikkiWinner.broadcastRoundEnd({pokerWinners, tikkiWinner:tikkiWinner.getSocket()});
        tikkiWinner.broadcastGame();
        return {tikkiWinner, pokerWinners}
    }

    setNextTurn(){
        const thisPlayers = Object.values(this.players);
        const cardsChanged = thisPlayers.every(player => player.cardsChanged);
        const cardsTabled = thisPlayers.every(player => player.cardTabled);
        if(cardsChanged && cardsTabled){
            // Tikki round has finished
            if(thisPlayers.every(player => player.cards.length === 0)){
                const {pokerWinners, tikkiWinner} = this.getWinner();
                setTimeout(() => {
                    this.toggleRevealHand();
                    thisPlayers.map(player => player.disableCardsChanged());
                    this.shuffleDeck();
                    this.deal();
                    tikkiWinner.broadcastGame();
                }, 8000);

            }
            this.turn = this.leader.playerId;
            this.setLand(null);
            this.leader = {
                playerId:null,
                cardValue:null
            }
            thisPlayers.map(player => player.disableCardTabled());
        }else{
            this.turn = this.getNextPlayer();
        }
    }

    addPlayer(player, cb){
        this.players[player.id] = player;
        cb();
        if(this.playersCount() === this.playersAmount){
            this.deal();
            player.broadcastGame();
        }
    }

    removePlayer(player){
        if(this.playersCount() === 1){
            delete rooms[this.name];
        }else{
            delete this.players[player.id]
        }
    }

    giveCard(){
        if(this.cards.length > 0){
            const givenCard = this.cards[0];
            this.deleteCard(givenCard);
            return givenCard;
        }
    }

    shuffleDeck(){
        const deck = [];
        // Create deck
        for(let land=0;land<4;land++){
            for(let i=0;i<13;i++){
                deck.push(new Card(land, i));
            }
        }
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        this.cards = deck;
    }

    deal(){
        for(let player in this.players){
            const thisPlayer = this.players[player];
            for(let i=0;i<5;i++){
                thisPlayer.receiveCard(this.giveCard());
            }
            // thisPlayer.emitAll();
        }
    }
}

module.exports = Game;