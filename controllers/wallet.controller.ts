import WalletAddressInfo from "../models/walletAddress";
import { walletList } from "../service/walletListData";

export const saveWalletAddressList = async () => {
  walletList.forEach(async (item: any, index: number) => {
    const newWalletAddressInfo = new WalletAddressInfo();
    newWalletAddressInfo.walletGroupName = item.walletGroupName;
    newWalletAddressInfo.walletName = item.walletName;
    newWalletAddressInfo.walletAddress = item.walletAddress;
    newWalletAddressInfo.network = item.network;
    await newWalletAddressInfo.save();
    console.log(index, "/", walletList.length);
  });
};

export const getAllEthereumWalletAddressList = async () => {
  const models = await WalletAddressInfo.find({ network: "ETHEREUM" });
  return models;
};
