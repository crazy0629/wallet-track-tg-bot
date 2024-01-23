import { model, Schema } from "mongoose";
import { IWalletAddressInfo } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const WalletAddressInfoSchema = new Schema(
  {
    walletGroupName: { type: String },
    walletName: { type: String },
    walletAddress: { type: String },
    network: { type: String },
  },
  { timestamps: true }
);

/**
 * IWalletAddressInfo Interface Document class inheritance
 */

export default model<IWalletAddressInfo>(
  "WalletAddressInfo",
  WalletAddressInfoSchema
);
