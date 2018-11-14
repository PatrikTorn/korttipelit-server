
import {connect} from '../connection';
import mongoose from 'mongoose';
const playerSchema = new mongoose.Schema({
    name: {
        required:true,
        type:String,
        unique:true
    },
    money:{
        required:false,
        default:500,
        type:Number
    },
    gamesPlayed:{
        default:0,
        type:Number
    },
    highestHand:{
        type:Number,
        default:0
    }
});

export const PlayerModel = mongoose.model('Player', playerSchema);
