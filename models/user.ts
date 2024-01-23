import { model, Schema } from "mongoose";
import { IUserInfo } from "../service/interfaces";

/**
 * Create a new Schema from mongoose
 */

const UserInfoSchema = new Schema(
  {
    userId: { type: Number },
  },
  { timestamps: true }
);

/**
 * IUserInfo Interface Document class inheritance
 */

export default model<IUserInfo>("UserInfo", UserInfoSchema);
