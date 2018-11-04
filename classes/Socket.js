const Card = require('../classes/Card');
const {io} = require('../config');
const {getRooms, getSockets, sockets, rooms, rankPokerHand} = require('../common');
class Socket {
    constructor(socket){
        this.socket = socket;
        this.name = ["Juho", "Patu", "Hene", "Teemu", "Kalle", "Ile"][Math.floor(Math.random()*5)]
        this.room = rooms.lobby;
        this.rooms = socket.rooms;
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
            room:this.room.name,
            name:this.name,
            id:this.id,
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

    revealHand(){
        this.shouldRevealHand = true;
        this.broadcastGame();
    }

    hideHand(){
        this.shouldRevealHand = false;
    }

    getHand(){
        const hand = [...this.cards, ...this.table];
        this.hand = rankPokerHand(hand);
        return {...rankPokerHand(hand), hand}
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
            this.receiveCard();
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

    receiveCard(){
        const card = this.room.giveCard()
        this.cards.push(card);
    }
    
    joinRoom(room, cb){
        this.leaveRoom(() => {
            this.room = room;
            room.addPlayer(this, () => {
                this.socket.join(room.name, cb);
            });
        })
    }

    leaveRoom(cb){
        this.room.removePlayer(this.socket);
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

    emitGame(){
        this.socket.emit('get game', this.room.getRoom());
    }

    emitSockets(){
        io.sockets.emit('get sockets', getSockets());
    }

    emitRooms(){
        io.sockets.emit('get rooms', getRooms());
    }

    broadcastGame(){
        io.sockets.in(this.room.name).emit('get game', this.room.getRoom())
    }
}

module.exports = Socket;