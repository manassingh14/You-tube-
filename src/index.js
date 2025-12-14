import dotenv from "dotenv";
dotenv.config();
import mongoose, { connect } from "mongoose";
 import express from "express";
 import { connectDB } from "./db/db.js";
  import app from "./app.js";
 connectDB().then(
    () => { 
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
 }).catch((err) => {
   console.log("Error in DB connection", err);
 });
// import { DB_Name } from "./constants.js";
// const app = express();
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
//         console.log("Connected to MongoDB");
//         app.on("error", (error) => {
//             console.log("Error in connecting to MongoDB", error);
//             throw error;
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     }
//     catch (error) {
//         console.log("Error in connecting to MongoDB", error);
//         throw error;
//     }

//     }) ();