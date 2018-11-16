import ps from 'pokersolver'; 
import botNames from './botNames.json'
const PokerSolver = ps.Hand;


// const hands=[
//     {
//         name:"Neloset",
//         points:7
//     },
//     {
//         name:"Värisuora",
//         points:8
//     }, 
//     {
//         name:"Suora",
//         points:4
//     },
//     {
//         name:"Väri",
//         points:5
//     }, 
//     {
//         name:"Hai",
//         points:1
//     },
//     {
//         name:"Pari",
//         points:2
//     },
//     {
//         name:"Kaksi paria",
//         points:3
//     },
//     {
//         name:"Kuningasvärisuora",
//         points:9
//     },
//     {
//         name:"Kolmoset",
//         points:4
//     },
//     {
//         name:"Täyskäsi",
//         points:6
//     }
// ];


const hands = {
    1:{
        name:"Hai",
        points:2
    },
    2:{
        name:"Pari",
        points:3
    },
    3:{
        name:"Kaksi paria",
        points:4
    },
    4:{
        name:"Kolmoset",
        points:5
    },
    5:{
        name:"Suora",
        points:6
    },
    6:{
        name:"Väri",
        points:7
    },
    7:{
        name:"Täyskäsi",
        points:8
    },
    8:{
        name:"Neloset",
        points:9
    },
    9:{
        name:"Värisuora",
        points:10
    }
};

export const botName = 'Bot-'+botNames[Math.floor(Math.random()*botNames.length)-1]

function rankPokerHand(cards){
    if(cards.length === 5){
        const hand = JSON.parse(JSON.stringify(PokerSolver.solve(cards)))
        return {...hands[hand.rank], rank:hand.rank};    
    }

    // const cs = cards.map(card => card.value);
    // const ss = cards.map(card => card.landNo);
    // // https://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math

    // // [10, J, Q, K, A], [ _["♠"], _["♠"], _["♠"], _["♠"], _["♠"] ] 
    // var v, i, o, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
    // for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {v += o*((v/o&15)+1);}
    // v = v % 15 - ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
    // v -= (ss[0] == (ss[1]|ss[2]|ss[3]|ss[4])) * ((s == 0x7c00) ? -5 : 1);
    // return hands[v];
}

function getPokerWinner(players){
    let handz = [];
    players.map(player => {
        const hand = PokerSolver.solve(player.getHand().hand.map(card => card.cardNo));
        hand.owner = player.id;
        handz.push(hand);
    });
    const winner = PokerSolver.winners(handz)[0].owner;
    return players.find(p => p.id === winner);
}



export {
    rankPokerHand,
    getPokerWinner
}


