import Room from './Room';
import Card from './Card';
import {io} from '../config';
import {getPokerWinner} from '../gameTools'

export default class Game extends Room {
    constructor(id, name, players, playersAmount){
        super(id, name, players, playersAmount);
        this.type = "game";
        this.playersAmount = playersAmount;
        this.cards = [];
        this.turn = players[0].id;
        this.shuffleDeck();
        this.land = null;
        this.leader = {
            playerId:null,
            cardRank:null
        }
        this.tikkiStarted = false;
        this.tikkiRoundWinner = null;
        this.tikkiWinner = null;
        this.pokerWinner = null;
        this.pointLimit = 1;
        this.bet = 50;
        this.gameWinner = null;
        this.moneyExchange = null;
        this.setTimer();
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
            tikkiWinner:this.tikkiWinner && this.tikkiWinner.getSelf(),
            pokerWinner:this.pokerWinner && this.pokerWinner.getSelf(),
            gameWinner:this.gameWinner,
            moneyExchange:this.moneyExchange,
            timer:this.timer
        }
    }

    setTimer(){
        this.duration = 10000;
        this.timer = {
            turnEnds:new Date().getTime() + this.duration,
            duration:this.duration
        }
    }


    revealHands(){
        this.players.map(player => {
            // setTimeout(() => {
                player.revealHand()
            // }, i * 5000)
        });
    }

    hideHands(){
        this.players.map(player => {
            player.hideHand();
        })
        this.broadcastGame();
    }

    findCard(card){
        return this.cards.find(c => c.id === card.id);
    }

    deleteCard(card){
        this.cards = this.cards.filter(c => c.id !== card.id);
    }

    setLand(land){
        this.land = land;
        this.players.map(player => {
            player.checkEnabledCards(land);
        });
    }

    setLeader(playerId, card){
        if(this.leader.playerId){
            if(card.rank > this.leader.cardRank && card.land === this.land){
                this.leader = {
                    playerId,
                    cardRank:card.rank
                }
            }
        }else{
            this.leader = {
                playerId,
                cardRank:card.rank
            }
        }
    }

    getNextPlayer(){
        const playerId = this.turn;
        const thisPlayers = this.players.map(player => player.id);
        const thisIndex = thisPlayers.indexOf(playerId);
        this.setTimer();
        if(playerId === thisPlayers[thisPlayers.length - 1]){
            return thisPlayers[0];
        }else{
            return thisPlayers[thisIndex + 1];
        }
    }


    getWinner(){
        this.tikkiWinner = this.players.find(player => player.id === this.leader.playerId);
        let tikkiPoints;
        if(this.leader.cardRank === 0) tikkiPoints = 4;
        else tikkiPoints = 2;
        this.tikkiWinner.addPoints(tikkiPoints)
        this.pokerWinner = getPokerWinner(this.players);
        this.pokerWinner.addPoints(this.pokerWinner.hand.points);
        this.broadcastGame();
        this.revealHands();
    }

    resetGame(){
        const tikkiWinner = this.tikkiWinner;
        this.tikkiStarted = false;
        this.tikkiRoundWinner = null;
        this.tikkiWinner = null;
        this.pokerWinner = null;
        this.hideHands();
        this.players.map(player => player.disableCardsChanged());
        this.shuffleDeck();
        this.deal();
        while (this.players.find(player => player.id === this.turn).type !== "human"){
            this.turn = this.getNextPlayer()
        }
        this.broadcastGame();
    }

    finishGame(){
        const winner = this.players.sort((a,b) => b.points-a.points)[0];
        this.players.map(player => {
            winner.earnMoney(player);
            player.setStats();
        });
        this.gameWinner = winner.getSelf();
        this.moneyExchange = this.players.map(player => ({...player.getSelf(), money:(winner.points - player.points)*this.bet}));
        this.broadcastGame();
        
        setTimeout(() => {
            this.players.map(player => {
                player.exitGame();
            });
        }, 5000);
    }


    removePlayer(player){
        let {rooms} = require('../common');
        this.players = this.players.filter(p => p.id !== player.id);
        if(this.playersCount() === 1){
            this.players[0].exitGame();
            delete rooms[this.id];
        }else{
            this.players.map(player => {
                player.emitGame();
            });
        }
    }

    setNextTurn(){
        const cardsChanged = this.players.every(player => player.cardsChanged);
        const cardsTabled = this.players.every(player => player.cardTabled);
        const cardsEnded = this.players.every(player => player.cards.length === 0);
        if(cardsChanged && cardsTabled){
            // Tikki round has finished
            if(cardsEnded){
                this.getWinner();
                if(this.tikkiWinner.points > this.pointLimit || this.pokerWinner.points > this.pointLimit){
                    return this.finishGame()
                }
                setTimeout(() => {
                    this.resetGame();
                },5000)

            }
            this.turn = this.leader.playerId;
            this.setTimer();
            this.tikkiRoundWinner = this.leader.playerId;
            this.setLand(null);
            this.leader = {
                playerId:null,
                cardValue:null
            }
            this.players.map(player => player.disableCardTabled());
        }else{
            if(cardsChanged && !cardsTabled){
                this.tikkiStarted = true;
                if(this.turn === this.tikkiRoundWinner){
                    this.players.filter(player => player.id !== this.turn)
                    .map(player => player.tableCard(null));
                }
            }
            this.turn = this.getNextPlayer();
        }

        const nextPlayer = this.players.find(player => player.id === this.turn)
        const isBotTurn = nextPlayer.type === "bot";
        if(isBotTurn && !cardsEnded){
            this.moveBot(nextPlayer)
        }    
    }

    moveBot(bot){
        setTimeout(() => {
            if(!bot.cardsChanged){
                bot.cardsChanged = true;
            }else if(!bot.cardTabled){
                    const firstCard = bot.cards
                    .filter(card => card.enabled)[0]
                    bot.tableCard(firstCard);
            }
            this.setNextTurn();
            this.broadcastGame();
        }, bot.type === "bot" ? 2500 : 0)
    }



    addPlayer(player, cb){
        this.players.push(player);
        cb();
        if(this.playersCount() === this.playersAmount){
            this.deal();
            this.broadcastGame();
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
        this.players.map(player => {
            for(let i=0;i<5;i++){
                player.receiveCard(this.giveCard());
            }
        });
    }

    broadcastGame(){
        io.sockets.in(this.id).emit('get game', this.getRoom())
    }

}
