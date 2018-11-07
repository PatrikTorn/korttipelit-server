import mongoose from 'mongoose';

const conString = `mongodb://PatrikTorn97:Kalezaya11@ds253353.mlab.com:53353/tikkipokka`;
export const connect = mongoose.connect(conString, {useNewUrlParser:true}, (err, success) => {
    if(err) console.log('Mongoose not connected')
    else console.log("Mongoose connected")
});
