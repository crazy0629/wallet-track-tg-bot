import {
  Address,
  createPublicClient,
  decodeAbiParameters,
  erc20Abi,
  fallback,
  formatEther,
  formatUnits,
  http,
  parseAbiParameters,
} from "viem";
import { mainnet } from "viem/chains";
import UniswapV2PairABI from "../abis/UniswapV2Pair.abi.json";
import { getAllEthereumWalletAddressList } from "../controllers/wallet.controller";
import { notifyUser } from "./bobot";

import dotenv from "dotenv";
dotenv.config();

export const erc20AndErc721TokenTransferFirstTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

let ethAddressList: any = [];

const publicClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http("https://eth.llamarpc.com"),
    http("https://ethereum.publicnode.com"),
    http("https://rpc.ankr.com/eth"),
    http("https://endpoints.omniatech.io/v1/eth/mainnet/public"),
    http("https://ethereum.blockpi.network/v1/rpc/public"),
    http("https://rpc.mevblocker.io"),
    http("https://mainnet.gateway.tenderly.co"),
    http("https://rpc.flashbots.net"),
    http("https://cloudflare-eth.com"),
    http("https://api.securerpc.com/v1"),
  ]),
});

const getTokenPrice = async (
  walletAddress,
  txHash,
  tokenAddress,
  changeAmount,
  inout
) => {
  try {
    const dextoolsData = (await (
      await fetch(
        `https://api.dextools.io/v1/token?chain=ether&address=${tokenAddress.toLowerCase()}`,
        { headers: { "X-API-Key": process.env.DEXTOOL_KEY as string } }
      )
    ).json()) as any;
    const tokenPrice = dextoolsData.data.reprPair.price;

    const tokenContractConfig = {
      address: tokenAddress,
      abi: erc20Abi,
    };
    const data = await publicClient.multicall({
      contracts: [
        {
          ...tokenContractConfig,
          functionName: "name",
        },
        {
          ...tokenContractConfig,
          functionName: "symbol",
        },
        {
          ...tokenContractConfig,
          functionName: "decimals",
        },
        {
          ...tokenContractConfig,
          functionName: "balanceOf",
          args: ["0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88"],
        },
      ],
    });
    const tokenSymbol = data[1].result;
    const currentAmount =
      Number(data[3].result!) / Math.pow(10, Number(data[2].result));
    const realChangeAmount =
      Number(changeAmount) / Math.pow(10, Number(data[2].result));
    const currentUsdPrice = tokenPrice * Number(currentAmount);
    const changeUsdPrice =
      tokenPrice * Number(formatUnits(changeAmount, Number(data[2].result)));
    const groupName = ethAddressList.filter(
      (item) => item.walletAddress == walletAddress
    )[0].walletGroupName;
    const walletName = ethAddressList.filter(
      (item) => item.walletAddress == walletAddress
    )[0].walletName;

    notifyUser(
      groupName,
      walletName,
      inout,
      realChangeAmount,
      tokenSymbol,
      changeUsdPrice,
      tokenPrice,
      currentAmount,
      currentUsdPrice,
      txHash
    );
  } catch (error) {
    console.error("Error fetching token data from Ethplorer:", error);
  }
};

const handleEthAmountChange = async (
  walletAddress,
  txHash,
  changeAmount,
  currentAmount,
  inout
) => {
  const data = await publicClient.readContract({
    address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
    abi: UniswapV2PairABI,
    functionName: "getReserves",
  });
  const ethUsd =
    Number(formatUnits((data as any)[0], 6)) /
    Number(formatEther((data as any)[1]));

  const tokenSymbol = "ETH";
  const changeUsdPrice = ethUsd * changeAmount;
  const currentUsdPrice = ethUsd * currentAmount;
  const groupName = ethAddressList.filter(
    (item) => item.walletAddress == walletAddress
  )[0].walletGroupName;
  const walletName = ethAddressList.filter(
    (item) => item.walletAddress == walletAddress
  )[0].walletName;

  notifyUser(
    groupName,
    walletName,
    inout,
    changeAmount,
    tokenSymbol,
    changeUsdPrice,
    ethUsd,
    currentAmount,
    currentUsdPrice,
    txHash
  );
};

export const getEthereumWalletAddressList = async () => {
  ethAddressList = await getAllEthereumWalletAddressList();
  //   ethAddressList = [
  //     {
  //       walletGroupName: "AAAA",
  //       walletName: "BBBB",
  //       walletAddress: "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
  //       network: "ETHEREUM",
  //     },
  //   ];
};

const checkIfWalletExists = (walletAddress) => {
  if (walletAddress == undefined) return false;
  const len = ethAddressList.filter(
    (item) => item.walletAddress == walletAddress
  );
  if (len == 0) return false;
  return true;
};

export const watchStart = () => {
  publicClient.watchBlocks({
    emitMissed: true,
    onBlock: async (block) => {
      console.log("block.number :>> ", block.number);
      const { transactions } = block;
      transactions.map(async (hash) => {
        await Promise.all([
          (async () => {
            const tx = await publicClient.getTransaction({ hash });
            if (tx.value > 0) {
              if (checkIfWalletExists(tx.from.toLowerCase())) {
                const walletAddress = tx.from.toLowerCase();
                const eth_balance = await publicClient.getBalance({
                  address: walletAddress as Address,
                });
                handleEthAmountChange(
                  walletAddress,
                  hash,
                  formatEther(tx.value),
                  formatEther(eth_balance),
                  "out"
                );
              } else if (checkIfWalletExists(tx.to?.toLowerCase())) {
                const walletAddress = tx.to?.toLowerCase();
                const eth_balance = await publicClient.getBalance({
                  address: walletAddress as Address,
                });
                handleEthAmountChange(
                  walletAddress,
                  hash,
                  formatEther(tx.value),
                  formatEther(eth_balance),
                  "in"
                );
              }
            }
          })(),
          (async () => {
            const txReceipt = await publicClient.getTransactionReceipt({
              hash,
            });
            txReceipt.logs.map(async (log) => {
              if (
                log.topics[0] === erc20AndErc721TokenTransferFirstTopic &&
                log.topics[1] &&
                log.topics[2] &&
                !log.topics[3]
              ) {
                const tokenAddress = log.address.toLowerCase();
                const [from] = decodeAbiParameters(
                  parseAbiParameters("address from"),
                  log.topics[1]
                );
                const [to] = decodeAbiParameters(
                  parseAbiParameters("address to"),
                  log.topics[2]
                );
                const [amount] = decodeAbiParameters(
                  parseAbiParameters("uint256 amount"),
                  log.data
                );
                if (checkIfWalletExists(from.toLowerCase())) {
                  getTokenPrice(
                    from.toLowerCase(),
                    hash,
                    tokenAddress,
                    amount,
                    "out"
                  );
                } else if (checkIfWalletExists(to.toLowerCase())) {
                  getTokenPrice(
                    to.toLowerCase(),
                    hash,
                    tokenAddress,
                    amount,
                    "in"
                  );
                }
              }
            });
          })(),
        ]);
      });
    },
  });
};
