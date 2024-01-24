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
  ctx.reply("Welcome to my bot! Use /choose to see the notification option.");
  const chatId = ctx.chat.id;
  await sendStartScreen(chatId);
});

const sendStartScreen = async (chatId) => {
  const caption =
    "$BO - Wallet Sniffer\n\n" +
    "Utility Meme\n" +
    "Bo spends his days mingling with the elite.\n" +
    "Political figures, celebrities, world-class sportsman and high calibre\n" +
    "crypto influencers are no strangers to Bo.\n\n" +
    "Bo-Bot Wallet Sniffer 💸🐕‍🦺\n" +
    "Get informed about live trades from all the top dogs in crypto, copy\n" +
    "trading and whale wallet tracking accessible on telegram, Let Bo do\n" +
    "the sniffing around so you can be more informed about market\n" +
    "manipulations and insider trading.\n\n" +
    "Hold at least 350 $BO to use the Bo-Bot Wallet Sniffer.\n\n" +
    "-----------------------------\n" +
    "Bwdg9Md8JV9Da3gESe79YJk9Aeg5M7jVqvRDdPNhbjP2\n" +
    "-----------------------------\n\n" +
    "<a href='https://bowalletsniffer.com/'>Website</a>\n" +
    "<a href='https://www.dextools.io/app/en/solana/pair-explorer/4VBJXK9zHFj6UPotD918eMFp1zuyJqyioGFqVVAxrdVc'>DexTools</a>\n" +
    "<a href='https://t.me/BoWalletSniffer'>Telegram</a>\n" +
    "<a href='https://t.me/WalletSnifferBoBot'>Bo-Bot</a>\n\n" +
    "This ones for Bo, This ones for Freedom";
  await sendPhoto(chatId, "https://imgur.com/a/Rwa6kgz", caption);
};

bot.command("choose", (ctx) => {
  const menu = new InlineKeyboard()
    .text("Yes", "yesOption")
    .text("No", "noOption")
    .row()
    .text("About", "about");

  ctx.reply(
    "Are you going to get notification from me about token amount changes?",
    { reply_markup: menu }
  );
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

bot.callbackQuery("about", (ctx) => {
  ctx.answerCallbackQuery();
  ctx.reply(
    "This is a simple Telegram bot that lets users about token amount change for listed wallets!."
  );
});

bot.command("message", async (ctx) => {
  const chatMessage = ctx.message.text;
  const chatId = ctx.chat.id;

  if (chatMessage.slice(9) == "hi") {
    await sendPhoto(
      chatId,
      "https://imgur.com/a/Rwa6kgz",
      "NEW TRANSACTION DETECTED \n\n" +
        "🏢 Assets Manager 🏢 " +
        "\n\n" +
        "👤 Blackrock \n" +
        "💵 Bought: $12,457,704 (300 BTC) \n" +
        "▶️ Price: $41,533.29 \n" +
        "🪙 Holdings: $4,982,842,800 (120,000 BTC) \n\n" +
        "Transaction: \n" +
        "0f9da66c1f93a690ae00550fedf24bfa16df44db47ec219f597d762953c2d93c\n" +
        "..................................................\n\n" +
        "Sniffed out by Bo-Bot!\n" +
        "Website | Telegram | Twitter | DexTools"
    );
    ctx.reply("Broadcast completed");
  }
});

const setMenu = async () => {
  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot." },
    {
      command: "choose",
      description: "Choose whether you are going to get notification or not.",
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
    "<a href='https://bowalletsniffer.com/'>Website</a> | <a href='https://t.me/BoWalletSniffer'>Telegram</a> | <a href='https://x.com/BoWalletSniffer'>Twitter</a> | <a href='https://www.dextools.io/app/en/solana/pair-explorer/4VBJXK9zHFj6UPotD918eMFp1zuyJqyioGFqVVAxrdVc'>DexTools</a>";
  const caption =
    "NEW TRANSACTION DETECTED \n\n" +
    `🏢 ${groupName} 🏢 ` +
    "\n\n" +
    `👤 ${walletName} \n` +
    `💵 ${inOut}: ${changeUSDPrice} (${changeAmount} ${tokenSymbol}) \n` +
    `▶️ Price: ${tokenPrice} \n` +
    `🪙 Holdings: $${currentUSDPrice} (${currentAmount} ${tokenSymbol}) \n\n` +
    "Transaction: \n" +
    `${transactionHash}\n` +
    "..................................................\n\n" +
    "Sniffed out by Bo-Bot!\n" +
    linkText;

  if (chatIdLists?.length == 0) return;
  chatIdLists?.forEach(async (chatId) => {
    await sendPhoto(chatId.userId, "https://imgur.com/a/Rwa6kgz", caption);
  });
};
