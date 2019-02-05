import mongoose from 'mongoose';
import {conString} from './secret';

export const connect = mongoose.connect(conString, {useNewUrlParser:true}, (err, success) => {
    if(err) console.log('Mongoose not connected')
    else console.log("Mongoose connected")
});
