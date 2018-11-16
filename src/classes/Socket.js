import {io} from '../config';
import {rankPokerHand} from '../gameTools';
import Card from './Card';
import * as PlayerService from '../services/PlayerService';

export default class Socket {
    constructor(socket, rooms, data){
        // db
        this.money = 99999;
        this.name = null;
        this.uuid = null;
        this.gamesPlayed = 0;
        this.highestHand = 0;

        // socket
        this.socket = socket;
        this.id = this.socket.id;

        // config
        this.type = "human";
        this.room = rooms.lobby;
        this.rooms = rooms;

        // game
        this.cards = [];
        this.table = [];
        this.cardsChanged = false;
        this.cardTabled = false;
        this.points = 0;
        this.firstTableCard = null;
        this.shouldRevealHand = false;
        this.cardTaken = false;
    }

    getSelf(){
        return {
            room:{
                id:this.room.id,
                type:this.room.type,
                gameType:this.room.gameType,
                name:this.room.name
            },
            name:this.name,
            uuid:this.uuid,
            id:this.id,
            type:this.type,
            money:this.money,
            cards:this.cards.sort((a,b) => b.rank-a.rank),
            table:this.table,
            cardsChanged:this.cardsChanged,
            cardTabled:this.cardTabled,
            points:this.points,
            hand:this.getHand(),
            firstTableCard:this.firstTableCard,
            shouldRevealHand:this.shouldRevealHand,
            gamesPlayed:this.gamesPlayed,
            highestHand:this.highestHand,
            cardTaken:this.cardTaken,
            isTurn: this.room.type === 'game' && this.room.turn.id === this.id
        }
    }

    getExp(){
        const experiences = {
            task:3,
            game: (bet, won) => (bet/100) * (won ? 5 : 2)
        }
        let exp;
        const levelDeg = Math.pow((1/300)*exp, 2) + (1/50)*exp;
        const level = Math.floor(levelDeg);

    }

    // Common functions

    getRooms(){
        return Object.values(this.rooms).map(room => room.getSelf())
    }

    earnMoney(player){
        const bet = player.room.bet;
        const exchange = (this.points - player.points) * bet;
        player.giveMoney(exchange)
        this.money = this.money + exchange;
        this.persistPlayer()
    }

    giveMoney(amount){
        this.money = this.money - amount;
        this.persistPlayer()
    }

    persistPlayer(){
        PlayerService.updatePlayer(this.getSelf())
    }

    initPlayer({name, _id, money, gamesPlayed, highestHand}){
        this.name = name;
        this.uuid = _id;
        this.money = money;
        this.highestHand = highestHand;
        this.gamesPlayed = gamesPlayed;
    }
    
    addPoints(points){
        this.points = this.points + points;
    }

    getFirstTable(){
        return this.table[this.table.length - 1];
    }

    findCard(card){
        return this.cards.find(c => c.id === card.id);
    }

    deleteCard(card){
        this.cards = this.cards.filter(c => c.id !== card.id);
    }

    enableCards(){
        this.cards.map(card => card.enableCard());
    }

    giveCard(card){
        this.deleteCard(card);
        this.room.receiveCard(card); 
    }

    receiveCard(card){
        if(card) this.cards.push(card);
    }
    
    joinRoom(room, cb){
        this.leaveRoom(() => {
            this.room = room;
            room.addPlayer(this, () => {
                this.socket.join(room.id, cb);
            });
        })
    }

    leaveRoom(cb){
        this.room.removePlayer(this);
        this.socket.leave(this.room, cb);
    }

    
    // Tikkipokeri functions

    tableCard(card){
        if(card){
            const givenCard = this.findCard(card);
            this.firstTableCard = givenCard;
            this.table.push(givenCard);
            if(!this.room.land){
                this.room.setLand(card.land);
            }
            this.room.setLeader(this.id, card);
            this.deleteCard(givenCard);
            this.cardTabled = true;
            this.cards.map(card => card.enableCard());
        }else{
            this.firstTableCard = card;
        }
    }

    setStats(){
        const handRank = this.getHand().rank;
        if(handRank > this.highestHand){
            this.highestHand = handRank;
        }
        this.gamesPlayed = this.gamesPlayed + 1;
        this.persistPlayer();
    }

    exitGame(){
        this.joinRoom(this.rooms.lobby, () => {
            this.cards = [];
            this.table = [];
            this.cardsChanged = false;
            this.cardTabled = false;
            this.points = 0;
            this.firstTableCard = null;
            this.shouldRevealHand = false;
            this.emitAll();
            this.resetGame()
        })
    }

    revealHand(){
        this.shouldRevealHand = true;
        this.broadcastGame();
    }

    hideHand(){
        this.shouldRevealHand = false;
    }

    getHand(){
        const hand = [...this.cards, ...this.table];
        this.hand = rankPokerHand(hand.map(card => card.cardNo));
        return {...this.hand, hand}
    }

    disableCardTabled(){
        this.cardTabled = false;
    }

    disableCardsChanged(){
        this.cardsChanged = false;
        this.table = [];
        this.firstTableCard = null;
    }

    checkEnabledCards(roomLand){
        // User does not have any room lands in hand
        if(this.cards.every(card => card.land !== roomLand)){
            this.cards.map(card => card.enableCard());
        }else{
            this.cards.map(card => {
                if(card.land === roomLand){
                    card.enableCard();
                }else{
                    card.disableCard();
                }
            });
        }

    }

    emitAll(){
        this.emitSocket();
        this.emitSockets();
        this.emitRooms();
    }

    emitSocket(){
        this.socket.emit('get socket', this.getSelf());
    }

    emitGame(game = this.room.getSelf()){
        this.socket.emit('get game', game);
    }

    
    resetGame(){
        this.socket.emit('reset game');
    }

    emitSockets(){
        // io.sockets.emit('get sockets', getSockets());
    }

    emitRooms(){
        io.sockets.emit('get rooms', this.getRooms());
    }

    broadcastGame(){
        io.sockets.in(this.room.id).emit('get game', this.room.getSelf())
    }
}