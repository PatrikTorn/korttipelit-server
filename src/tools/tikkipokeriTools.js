import ps from "pokersolver";
export const HANDS = {
  1: {
    name: "Hai",
    points: 2,
  },
  2: {
    name: "Pari",
    points: 3,
  },
  3: {
    name: "Kaksi paria",
    points: 4,
  },
  4: {
    name: "Kolmoset",
    points: 5,
  },
  5: {
    name: "Suora",
    points: 6,
  },
  6: {
    name: "Väri",
    points: 7,
  },
  7: {
    name: "Täyskäsi",
    points: 8,
  },
  8: {
    name: "Neloset",
    points: 9,
  },
  9: {
    name: "Värisuora",
    points: 10,
  },
};

const CARD_NUMBERS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const rankPokerHand = (cards) => {
  const PokerSolver = ps.Hand;
  if (cards.length === 5) {
    let solved;
    try {
      solved = PokerSolver.solve(cards);
    } catch (e) {
      console.log("Failed to solve poker cards", e, cards);
    }
    if (!solved) return;
    const hand = JSON.parse(JSON.stringify(solved));
    const handHigh = hand.descr;
    let rankCards = [];
    CARD_NUMBERS.map((value) => {
      if (handHigh.includes(value)) {
        rankCards.push(value);
      }
    });
    return { ...HANDS[hand.rank], rank: hand.rank, rankCards };
  }
};

export const getPokerWinner = (players) => {
  let handz = [];
  players.map((player) => {
    const hand = PokerSolver.solve(
      player.getHand().hand.map((card) => card.cardNo)
    );
    hand.owner = player.id;
    handz.push(hand);
  });
  const winner = PokerSolver.winners(handz)[0].owner;
  return players.find((p) => p.id === winner);
};
