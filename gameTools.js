import ps from 'pokersolver'; 
const PokerSolver = ps.Hand;
const hands=[
    {
        name:"Neloset",
        points:7
    },
    {
        name:"Värisuora",
        points:8
    }, 
    {
        name:"Suora",
        points:4
    },
    {
        name:"Väri",
        points:5
    }, 
    {
        name:"Hai",
        points:1
    },
    {
        name:"Pari",
        points:2
    },
    {
        name:"Kaksi paria",
        points:3
    },
    {
        name:"Kuningasvärisuora",
        points:9
    },
    {
        name:"Kolmoset",
        points:4
    },
    {
        name:"Täyskäsi",
        points:6
    }
];

function rankPokerHand(cards){
    const cs = cards.map(card => card.value);
    const ss = cards.map(card => card.landNo);
    // https://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math

    // [10, J, Q, K, A], [ _["♠"], _["♠"], _["♠"], _["♠"], _["♠"] ] 
    var v, i, o, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
    for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {v += o*((v/o&15)+1);}
    v = v % 15 - ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
    v -= (ss[0] == (ss[1]|ss[2]|ss[3]|ss[4])) * ((s == 0x7c00) ? -5 : 1);
    return hands[v];
}

function getPokerWinner(players){
    let handz = [];
    for(let player in players){
        const thisPlayer = players[player];
        const hand = PokerSolver.solve(thisPlayer.getHand().hand.map(card => card.cardNo));
        hand.owner = thisPlayer.id;
        handz.push(hand);
    }
    const winner = PokerSolver.winners(handz)[0].owner;
    return players[winner];
}

export {
    rankPokerHand,
    getPokerWinner
}


