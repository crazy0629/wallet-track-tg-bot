import mongoose from "mongoose";
import dotenv from "dotenv";
import { saveWalletAddressList } from "./controllers/wallet.controller";
import { startBot } from "./service/bobot";
import {
  getEthereumWalletAddressList,
  watchStart,
} from "./service/ethereumTrack";
dotenv.config();
/**
 * Connection to DB
 * Using Mongoose
 * MongoClientOptions
 */
mongoose.connect(process.env.MONGO_URI as string);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log(">> MongoDB is Connected!");
  // saveWalletAddressList();
  getEthereumWalletAddressList();
  watchStart();
  startBot();
});

connection.on("error", (err) => {
  console.log(err);
});
