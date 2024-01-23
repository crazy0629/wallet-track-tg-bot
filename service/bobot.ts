const { Bot, InlineKeyboard } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");

import { removeUserId, saveUserId } from "../controllers/user.controller";

import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);
bot.api.config.use(autoRetry());

bot.command("start", (ctx) => {
  ctx.reply("Welcome to my bot! Use /choose to see the notification option.");
});

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
    await bot.api.sendPhoto(chatId, photoUrl, { caption });
  } catch (error) {
    console.error(`Failed to send photo to ${chatId}:`, error);
  }
};

export const startBot = () => {
  setMenu();
  bot.start();
  console.log("bot started");
};
