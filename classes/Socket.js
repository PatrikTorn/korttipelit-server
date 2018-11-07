import {io} from '../config';
import {rankPokerHand} from '../gameTools';
import * as PlayerService from '../services/PlayerService';

export default class Socket {
    constructor(socket, rooms){
        this.money = 99999;
        this.name = null;
        this.uuid = null;
        this.socket = socket;
        this.type = "human";
        this.room = rooms.lobby;
        this.rooms = rooms;
        this.id = this.socket.id;
        this.cards = [];
        this.table = [];
        this.cardsChanged = false;
        this.cardTabled = false;
        this.points = 0;
        this.firstTableCard = null;
        this.shouldRevealHand = false;
    }

    getSocket(){
        return {
            room:{
                id:this.room.id,
                type:this.room.type,
                name:this.room.name
            },
            name:this.name,
            uuid:this.uuid,
            id:this.id,
            type:this.type,
            money:this.money,
            cards:this.cards,
            table:this.table,
            cardsChanged:this.cardsChanged,
            cardTabled:this.cardTabled,
            points:this.points,
            hand:this.getHand(),
            firstTableCard:this.firstTableCard,
            shouldRevealHand:this.shouldRevealHand
        }
    }

    getRooms(){
        return Object.values(this.rooms).map(room => room.getRoom())
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
        PlayerService.updatePlayer(this.getSocket())
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

    initPlayer({name, _id, money}){
        this.name = name;
        this.uuid = _id;
        this.money = money;
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

    selectCard(card){
        const thisCard = this.findCard(card);
        thisCard.selected = !thisCard.selected;
    }

    giveCard(card){
        // const givenCard = this.findCard(card);
        this.deleteCard(card);
    }

    changeCards(cards){
        cards.map(card => {
            this.giveCard(card);
            this.receiveCard(this.room.giveCard());
        });
        this.cardsChanged = true;
    }

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

    receiveCard(card){
        this.cards.push(card);
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

    emitAll(){
        this.emitSocket();
        this.emitSockets();
        this.emitRooms();
    }

    emitSocket(){
        this.socket.emit('get socket', this.getSocket());
    }

    emitGame(game = this.room.getRoom()){
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
        io.sockets.in(this.room.id).emit('get game', this.room.getRoom())
    }
}
