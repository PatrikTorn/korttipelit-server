import mongoose from "mongoose";

const conString = process.env.DB_CONNECTION_STRING;

export const connect = mongoose.connect(
  conString,
  { useNewUrlParser: true },
  (err, success) => {
    if (err) console.log("Mongoose not connected", err);
    else console.log("Mongoose connected");
  }
);
