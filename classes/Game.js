import Room from './Room';
import Card from './Card';
import {getPokerWinner} from '../gameTools'

export default class Game extends Room {
    constructor(id, name, players, playersAmount){
        super(id, name, players, playersAmount);
        this.type = "game";
        this.playersAmount = playersAmount;
        this.cards = [];
        this.turn = Object.keys(players)[0];
        this.shuffleDeck();
        this.land = null;
        this.leader = {
            playerId:null,
            cardValue:null
        }
        this.tikkiStarted = false;
        this.tikkiRoundWinner = null;
        this.tikkiWinner = null;
        this.pokerWinner = null;
        this.pointLimit = 12;
        this.bet = 75;
    }

    getRoom(){
        return {
            id:this.id,
            name:this.name,
            type:this.type,
            deck:this.deck,
            trash:this.trash,
            cards:this.cards,
            players:this.formatPlayers(),
            turn:this.turn,
            land:this.land,
            tikkiStarted:this.tikkiStarted,
            tikkiRoundWinner:this.tikkiRoundWinner,
            tikkiWinner:this.tikkiWinner && this.tikkiWinner.getSocket(),
            pokerWinner:this.pokerWinner && this.pokerWinner.getSocket()
        }
    }


    

    revealHands(){
        const thisPlayers = Object.values(this.players);
        thisPlayers.map((player, i) => {
            // setTimeout(() => {
                player.revealHand()
            // }, i * 5000)
        });
    }

    hideHands(){
        const thisPlayers = Object.values(this.players);
        thisPlayers.map(player => {
            player.hideHand();
        })
        thisPlayers[0].broadcastGame();
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
        this.tikkiWinner = this.players[this.leader.playerId];
        let tikkiPoints;
        if(this.leader.cardValue === 1) tikkiPoints = 4;
        else tikkiPoints = 2;
        this.tikkiWinner.addPoints(tikkiPoints)
        this.pokerWinner = getPokerWinner(this.players);
        this.pokerWinner.addPoints(this.pokerWinner.hand.points);
        this.tikkiWinner.broadcastGame();
        this.revealHands();
    }

    resetGame(){
        const thisPlayers = Object.values(this.players);
        setTimeout(() => {
            const tikkiWinner = this.tikkiWinner;
            this.tikkiStarted = false;
            this.tikkiRoundWinner = null;
            this.tikkiWinner = null;
            this.pokerWinner = null;
            this.hideHands();
            thisPlayers.map(player => player.disableCardsChanged());
            this.shuffleDeck();
            this.deal();
            while (this.players[this.turn].type !== "human"){
                this.turn = this.getNextPlayer()
            }

            tikkiWinner.broadcastGame();
        }, thisPlayers.length * 3000);
    }

    finishGame(){
        const thisPlayers = Object.values(this.players);
        const winner = thisPlayers.sort((a,b) => b.points-a.points)[0];
        thisPlayers.map(player => winner.earnMoney(player));       
        thisPlayers.map(player => {
            player.exitGame();
        });
    }


    removePlayer(player){
        let {rooms} = require('../common');
        delete this.players[player.id];
        if(this.playersCount() === 1){
            Object.values(this.players)[0].exitGame();
            delete rooms[this.id];
        }else{
            Object.values(this.players).map(player => {
                player.emitGame();
            });
        }
    }

    setNextTurn(){
        const thisPlayers = Object.values(this.players);
        const cardsChanged = thisPlayers.every(player => player.cardsChanged);
        const cardsTabled = thisPlayers.every(player => player.cardTabled);
        const cardsEnded = thisPlayers.every(player => player.cards.length === 0);
        if(cardsChanged && cardsTabled){
            // Tikki round has finished
            if(cardsEnded){
                this.getWinner();
                if(this.tikkiWinner.points > this.pointLimit || this.pokerWinner.points > this.pointLimit){
                    return this.finishGame()
                }
                this.resetGame();
            }
            this.turn = this.leader.playerId;
            this.tikkiRoundWinner = this.leader.playerId;
            this.setLand(null);
            this.leader = {
                playerId:null,
                cardValue:null
            }
            thisPlayers.map(player => player.disableCardTabled());
        }else{
            if(cardsChanged && !cardsTabled){
                this.tikkiStarted = true;
                if(this.turn === this.tikkiRoundWinner){
                    thisPlayers.filter(player => player.id !== this.turn)
                    .map(player => player.tableCard(null));
                }
            }
            this.turn = this.getNextPlayer();
        }

        const nextPlayer = this.players[this.turn];
        const isBotTurn = nextPlayer.type === "bot";
        if(isBotTurn && !cardsEnded){
            this.moveBot(nextPlayer)
        }    
    }

    moveBot(bot){
        if(!bot.cardsChanged){
            bot.changeCards();
        }else if(!bot.cardTabled){
            setTimeout(() => {
                const firstCard = bot.cards
                .filter(card => card.enabled)[0]
                bot.tableCard(firstCard);
                this.setNextTurn();
                bot.broadcastGame();
            }, 1000)

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


    giveCard(){
        if(this.cards.length > 0){
            const givenCard = this.cards[0];
            this.deleteCard(givenCard);
            return givenCard;
        }else{
            return {}
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
        }
    }
}
