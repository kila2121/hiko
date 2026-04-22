import * as dotenv from "dotenv";
import { Bot, InlineKeyboard } from "grammy";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN отсутствует");
}

const bot = new Bot(BOT_TOKEN);

let businessModeEnabled = true;

const getControlKeyboard = () => {
  const toggleText = businessModeEnabled ? "🔴 Выключить бизнес-режим" : "🟢 Включить бизнес-режим";
  
  return new InlineKeyboard()
    .text(toggleText, "toggle_business")
    .row()
    .text("📊 Статус", "status")
    .text("ℹ️ Помощь", "help");
};

bot.command("start", async (ctx) => {
  const status = businessModeEnabled ? "🟢 включен" : "🔴 выключен";
  await ctx.reply(
    `Приветствую, хозяин!\n\n` +
    `Текущий статус бизнес-режима: ${status}\n\n` +
    `Используйте кнопки ниже для управления:`,
    { reply_markup: getControlKeyboard() }
  );
});

bot.command("status", async (ctx) => {
  const status = businessModeEnabled ? "🟢 ВКЛЮЧЕН" : "🔴 ВЫКЛЮЧЕН";
  await ctx.reply(`Статус бизнес-режима: ${status}`, { reply_markup: getControlKeyboard() });
});

bot.command("panel", async (ctx) => {
  await ctx.reply("🎛 Панель управления:", { reply_markup: getControlKeyboard() });
});

bot.callbackQuery("toggle_business", async (ctx) => {
  businessModeEnabled = !businessModeEnabled;
  const status = businessModeEnabled ? "🟢 ВКЛЮЧЕН" : "🔴 ВЫКЛЮЧЕН";
  
  await ctx.editMessageText(
    `✅ Бизнес-режим ${status}\n\n` +
    `Теперь бот ${businessModeEnabled ? "будет" : "НЕ будет"} уведомлять о новых клиентах.`,
    { reply_markup: getControlKeyboard() }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("status", async (ctx) => {
  const status = businessModeEnabled ? "🟢 ВКЛЮЧЕН" : "🔴 ВЫКЛЮЧЕН";
  await ctx.editMessageText(
    `📊 Текущий статус: ${status}\n\n` +
    `Бизнес-режим ${businessModeEnabled ? "активен" : "неактивен"}.`,
    { reply_markup: getControlKeyboard() }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("help", async (ctx) => {
  await ctx.editMessageText(
    `ℹ️ Помощь по боту:\n\n` +
    `🔹 /start - Главное меню\n` +
    `🔹 /status - Проверить статус\n` +
    `🔹 /panel - Панель управления\n\n` +
    `Бизнес-режим: когда включен, бот уведомляет вас о новых сообщениях, которые пишут вам в личку.`,
    { reply_markup: getControlKeyboard() }
  );
  await ctx.answerCallbackQuery();
});

bot.on("business_message", async (ctx) => {
  if (!businessModeEnabled) {
    console.log("Бизнес-режим выключен, игнорируем сообщение");
    return;
  }

  const connection = await ctx.getBusinessConnection();
  const businessOwnerId = connection.user.id;

  const sender = ctx.from;
  if (!sender) return;

  if (sender.id === businessOwnerId) return;

  console.log(`Новое сообщение от клиента: ${sender.first_name}`);

  const dossier = `
🕵️ НОВЫЙ КЛИЕНТ
👤 Имя: ${sender.first_name} ${sender.last_name ?? ""}
🆔 ID: ${sender.id}
📛 Username: @${sender.username ?? "нет"}
💬 Сообщение: ${ctx.msg.text ?? "не текст"}
  `.trim();

  await ctx.api.sendMessage(businessOwnerId, dossier);
});

bot.on("message").filter((ctx) => ctx.chat.type === "private", async (ctx) => {
  await ctx.reply(
    "✅ Бот работает!\n\n" +
    "Используйте /panel для управления бизнес-режимом."
  );
});

bot.start({
  onStart: (me) => console.log(`🤖 Бот @${me.username} запущен`),
});