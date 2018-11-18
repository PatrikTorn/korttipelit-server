
import {connect} from '../connection';
import mongoose from 'mongoose';
const playerSchema = new mongoose.Schema({
    name: {
        required:true,
        type:String,
        unique:true
    },
    password: {
        required:false,
        type:String
    },
    fbId:{
        required:false,
        type:String
    },
    money:{
        required:false,
        default:500,
        type:Number
    },
    experience:{
        type:Number,
        required:false,
        default:0
    },
    level:{
        type:Number,
        required:false,
        default:1
    },
    games:{
        type:Array,
        required:false
    },
    tasks:{
        type:Array,
        required:false
    },
    gamesPlayed:{
        default:0,
        type:Number
    },
    highestHand:{
        type:Map,
        default:{
            hand:[],
            rank:0,
            name:null,
            points:0
        }
    }
});

export const PlayerModel = mongoose.model('Player', playerSchema);
