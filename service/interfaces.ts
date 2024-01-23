import { Document, Schema } from "mongoose";

export interface IWalletAddressInfo extends Document {
  walletName: string;
  walletAddress: string;
  network: string; // ETHEREUM | BITCOIN
}

export interface IUserInfo extends Document {
  userId: number;
}
