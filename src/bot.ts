import { Bot } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = process.env.OWNER_ID;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN отсутвутсвует");
}

if (!OWNER_ID) {
  throw new Error("OWNER_ID отсутвутсвует");
}

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