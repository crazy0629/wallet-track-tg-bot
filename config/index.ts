import dotenv from "dotenv";

dotenv.config();

/**************************************  Server Consts variables  ***********************************/

export const SECRET_KEY =
  (process.env.SECRET_KEY as string) || "wallet-track-tg-bot";
