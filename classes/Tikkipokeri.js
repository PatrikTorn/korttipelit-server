import Game from './Game';
import Card from './Card';
import {getPokerWinner} from '../gameTools'

export default class Tikkipokeri extends Game {
    constructor(id, name, players, config){
        super(id, name, players);
        this.gameType = "tikkipokeri";
        // this.playersAmount = playersAmount;
        
        this.pointLimit = config.pointLimit;
        this.bet = config.bet;
        this.playersAmount = config.playersAmount;

        this.cards = [];
        this.turn = players[0];
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
        this.gameWinner = null;
        this.moneyExchange = null;
    }

    getSelf(){
        return {
            id:this.id,
            name:this.name,
            type:this.type,
            gameType:this.gameType,
            cards:this.cards,
            players:this.formatPlayers(),
            turn:this.turn.id,
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

    
    selectCard(card){
        const thisCard = this.turn.findCard(card);
        thisCard.selected = !thisCard.selected;
    }

    changeCards(cards){
        (cards || []).map(card => {
            const newCard = new Card(card.landId, card.rank);
            this.turn.giveCard(newCard);
            this.turn.receiveCard(this.giveCard());
        });
        this.turn.cardsChanged = true;
    }

    revealHands(){
        this.players.map(player => {
            player.revealHand()
        });
    }

    hideHands(){
        this.players.map(player => {
            player.hideHand();
        })
        this.broadcastGame();
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
        this.tikkiStarted = false;
        this.tikkiRoundWinner = null;
        this.tikkiWinner = null;
        this.pokerWinner = null;
        this.hideHands();
        this.players.map(player => player.disableCardsChanged());
        this.shuffleDeck();
        this.deal();
        while (this.players.find(player => player.id === this.turn.id).type !== "human"){
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
            this.turn = this.findPlayer(this.leader.playerId);
                
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
                if(this.tikkiRoundWinner && this.turn.id === this.findPlayer(this.tikkiRoundWinner).id){
                    this.players.filter(player => player.id !== this.turn.id)
                    .map(player => player.tableCard(null));
                }
            }
            this.turn = this.getNextPlayer();
        }
        // const nextPlayer = this.findPlayer(this.turn.id)
        const isBotTurn = this.turn.type === "bot";
        if(isBotTurn && !cardsEnded){
            this.moveBot(this.turn)
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

}
