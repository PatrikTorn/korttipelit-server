
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
    }
});

export const PlayerModel = mongoose.model('Player', playerSchema);
