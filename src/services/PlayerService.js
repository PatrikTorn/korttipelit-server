import {PlayerModel as Player} from '../models';

async function createPlayer(playerName){
    return await Player.create({
        name:playerName
    });
}

async function findPlayer(playerName){
    return await Player.findOne({
        name:playerName
    });
}

async function updatePlayer(player){
    return await Player.findByIdAndUpdate(
        player.uuid,
        {
            money:player.money,
            gamesPlayed:player.gamesPlayed,
            highestHand:player.highestHand,
            tasks:player.tasks,
            games:player.games,
            experience:player.experience,
            level:player.level
        },
        {new: false},
    );
}

async function checkPlayer(name) {
    const foundUser = await findPlayer(name);
    if(foundUser){
        return foundUser;
    }else{
        return await createPlayer(name);
    }
}

export{
    checkPlayer,
    createPlayer,
    findPlayer,
    updatePlayer
}