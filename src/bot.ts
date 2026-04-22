import { Bot } from "grammy";

const BOT_TOKEN = "8624189748:AAGYpNZ96VdgbfWuZRaGtm8jwUTx1wYSU9g";
const OWNER_ID = 1095175548;

const bot = new Bot(BOT_TOKEN);

bot.on("business_message", async (ctx) => {
  // 1. Получаем информацию о бизнес-подключении
  const connection = await ctx.getBusinessConnection();
  const businessOwnerId = connection.user.id;

  const sender = ctx.from;
  if (!sender) return;

  // 2. Определяем, кто автор сообщения
  // Если это вы сами — игнорируем
  if (sender.id === businessOwnerId) return;

  // 3. Клиент (незнакомец) написал вам
  console.log(`Новое сообщение от клиента: ${sender.first_name}`);

  // 4. Отправляем досье вам в «Избранное» или личку с ботом
  const dossier = `
  🕵️ НОВЫЙ КЛИЕНТ
  👤 Имя: ${sender.first_name} ${sender.last_name ?? ""}
  🆔 ID: ${sender.id}
  📛 Username: @${sender.username ?? "нет"}
  💬 Сообщение: ${ctx.msg.text ?? "не текст"}
    `.trim();

  await ctx.api.sendMessage(OWNER_ID, dossier);

  // 5. Опционально: автоответ клиенту от вашего имени
  await ctx.reply("Здравствуйте! Я скоро отвечу.");
});


bot.on("message").filter((ctx) => ctx.chat.type === "private", async (ctx) => {
  console.log("Обычное личное сообщение:", ctx.message?.text);
  console.log("От пользователя:", ctx.from?.first_name, ctx.from?.id);
  
  await ctx.reply("✅ Бот работает! Тестовый режим.");
});

// Простой обработчик команды /start
bot.command("start", async (ctx) => {
  await ctx.reply("👋 Бот активен. Используйте Business Mode для обработки клиентов.");
});

bot.start({
  onStart: (me) => console.log(`🤖 Бот @${me.username} запущен`),
});