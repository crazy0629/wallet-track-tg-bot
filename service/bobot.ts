const { Bot, InlineKeyboard } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");

import {
  getAllUserIdLists,
  removeUserId,
  saveUserId,
} from "../controllers/user.controller";

import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);
bot.api.config.use(autoRetry());

bot.command("start", async (ctx) => {
  const chatId = ctx.chat.id;
  await sendStartScreen(chatId);
  await saveUserId(chatId);
});

const sendStartScreen = async (chatId) => {
  const caption =
    "<b>$BO - Wallet Sniffer</b>\n\n" +
    "<b>Utility Meme</b>\n" +
    "Bo spends his days mingling with the elite.\n" +
    "Political figures, celebrities, world-class sportsman and high calibre\n" +
    "crypto influencers are no strangers to Bo.\n\n" +
    "<b>Bo-Bot Wallet Sniffer 💸🐕‍🦺</b>\n" +
    "Get informed about live trades from all the top dogs in crypto, copy\n" +
    "trading and whale wallet tracking accessible on telegram, Let Bo do\n" +
    "the sniffing around so you can be more informed about market\n" +
    "manipulations and insider trading.\n\n" +
    "<b>Hold at least 350 $BO to use the Bo-Bot Wallet Sniffer.</b>\n\n" +
    "<b>-----------------------------</b>\n" +
    "Bwdg9Md8JV9Da3gESe79YJk9Aeg5M7jVqvRDdPNhbjP2\n" +
    "<b>-----------------------------</b>\n\n" +
    "<a href='https://bowalletsniffer.com/'><b>Website</b></a>\n" +
    "<a href='https://www.dextools.io/app/en/solana/pair-explorer/4VBJXK9zHFj6UPotD918eMFp1zuyJqyioGFqVVAxrdVc'><b>DexTools</b></a>\n" +
    "<a href='https://t.me/BoWalletSniffer'><b>Telegram</b></a>\n" +
    "<a href='https://t.me/WalletSnifferBoBot'><b>Bo-Bot</b></a>\n\n" +
    "This ones for Bo, This ones for Freedom 🇺🇸";
  await sendPhoto(chatId, "https://imgur.com/a/Rwa6kgz", caption);
};

bot.command("option", (ctx) => {
  const menu = new InlineKeyboard()
    .text("Yes", "yesOption")
    .text("No", "noOption")
    .row()
    .text("About", "about");

  ctx.reply("Do you want to subscribe to get notifications?", {
    reply_markup: menu,
  });
});

bot.callbackQuery("yesOption", async (ctx) => {
  ctx.answerCallbackQuery();
  const chatId = ctx.chat.id;
  const result = await saveUserId(chatId);
  ctx.reply(result?.message);
});

bot.callbackQuery("noOption", async (ctx) => {
  ctx.answerCallbackQuery();
  const chatId = ctx.chat.id;
  const result = await removeUserId(chatId);
  ctx.reply(result?.message);
});

bot.callbackQuery("about", async (ctx) => {
  const chatId = ctx.chat.id;
  ctx.answerCallbackQuery();
  await sendStartScreen(chatId);
});

bot.command("message", async (ctx) => {
  const chatMessage = ctx.message.text;
  const chatId = ctx.chat.id;
});

const setMenu = async () => {
  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot." },
    {
      command: "option",
      description: "Config your subscription.",
    },
  ]);
};

const sendPhoto = async (chatId, photoUrl, caption) => {
  try {
    await bot.api.sendPhoto(chatId, photoUrl, { caption, parse_mode: "html" });
  } catch (error) {
    console.error(`Failed to send photo to ${chatId}:`, error);
  }
};

export const startBot = () => {
  setMenu();
  bot.start();
  console.log("bot started");
};

export const notifyUser = async (
  groupName,
  walletName,
  inOut,
  changeAmount,
  tokenSymbol,
  changeUSDPrice,
  tokenPrice,
  currentAmount,
  currentUSDPrice,
  transactionHash
) => {
  const chatIdLists = await getAllUserIdLists();
  const linkText =
    "<b><a href='https://bowalletsniffer.com/'>Website</a> | <a href='https://t.me/BoWalletSniffer'>Telegram</a> | <a href='https://x.com/BoWalletSniffer'>Twitter</a> | <a href='https://www.dextools.io/app/en/solana/pair-explorer/4VBJXK9zHFj6UPotD918eMFp1zuyJqyioGFqVVAxrdVc'>DexTools</a></b>";
  const caption =
    "<b>NEW TRANSACTION DETECTED</b> \n\n" +
    `<b>🏢 ${groupName} 🏢 </b>` +
    "\n\n" +
    `<b>👤 ${walletName} </b>\n` +
    `<b>💵 ${inOut}: ${changeUSDPrice} (${changeAmount} ${tokenSymbol})</b> \n` +
    `<b>▶️ Price: ${tokenPrice}</b> \n` +
    `<b>🪙 Holdings: $${currentUSDPrice} (${currentAmount} ${tokenSymbol})</b> \n\n` +
    "<b>Transaction:</b> \n" +
    `<b><a href='https://etherscan.io/tx/${transactionHash}'>${transactionHash}</a></b>\n` +
    "..................................................\n\n" +
    "Sniffed out <b>by Bo-Bot!</b>\n" +
    linkText;

  if (chatIdLists?.length == 0) return;
  chatIdLists?.forEach((chatId) => {
    sendPhoto(chatId.userId, "https://imgur.com/a/Rwa6kgz", caption);
  });
};
