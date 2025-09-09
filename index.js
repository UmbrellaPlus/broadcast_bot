const { Bot, session, Keyboard } = require("grammy");
const { savePatient, exportPatientsByCity } = require('./db');
const parseBirthday = require('./birthday');
const sendSMS = require('./broadcast');


const bot = new Bot("8302129711:AAHdhGXk8dMwswjZ6M6VCIVHhIu1ZegO2zM");

// Сессия — будем хранить текущие шаги пользователя
bot.use(session({ initial: () => ({ step: "city", data: {} }) }));

// Кнопки выбора города
const cityKeyboard = new Keyboard()
    .text("Харьков").row()
    .text("Киев").row()
    .text("Одесса").row()
    .text("Днепр").row()
    .text("Запорожье").row()
    .text("Львов")
    .resized();

// Кнопки выбора действия
const actionKeyboard = new Keyboard()
    .text("➕ Добавить пациента").row()
    .text("📢 Сделать рассылку").row()
    .text("📊 Экспортировать пациентов")
    .resized();

bot.command("start", async (ctx) => {
    ctx.session = { step: "city", data: {} };
    await ctx.reply("Выберите город:", { reply_markup: cityKeyboard });
});

bot.on("message:text", async (ctx) => {
    const step = ctx.session.step;
    const text = ctx.message.text;

    if (step === "city") {
        if (!["Харьков", "Киев", "Одесса", "Днепр", "Запорожье", "Львов"].includes(text)) {
            return ctx.reply("Пожалуйста, выберите город с кнопок.");
        }
        ctx.session.data.city = text;
        ctx.session.step = "action";
        return ctx.reply(`Вы выбрали город: ${text}\nЧто вы хотите сделать?`, {
            reply_markup: actionKeyboard,
        });
    }

    if (step === "action") {
        if (text === "➕ Добавить пациента") {
            ctx.session.step = "address";
            return ctx.reply("Введите адрес пациента:");
        } else if (text === "📢 Сделать рассылку") {
            ctx.session.step = "done";
            return ctx.reply("Рассылка пока не реализована.");
        } else if (text == "📊 Экспортировать пациентов") {
            await exportPatientsByCity(ctx,ctx.session.data.city)
        }else {
            return ctx.reply("Выберите действие из меню.");
        }
    }

    if (step === "address") {
        ctx.session.data.address = text;
        ctx.session.step = "name";
        return ctx.reply("Введите имя пациента (или напишите «Пропустить»):");
    }

    if (step === "name") {
        ctx.session.data.name = text.toLowerCase() !== "пропустить" ? text : null;
        ctx.session.step = "phone";
        return ctx.reply("Введите номер телефона (обязательно):");
    }

    if (step === "phone") {
        const phone = text.trim();
        if (!/^380\d{9}$/.test(phone)) {
            return ctx.reply("Введите корректный номер телефона (только цифры).");
        }
        ctx.session.data.phone = phone;
        ctx.session.step = "birthday";
        return ctx.reply("Введите день рождения (или напишите «Пропустить»):");
    }

    const birthday = parseBirthday(text)
    if (step === "birthday") {
        if (!birthday && text.toLowerCase() !== "пропустить") {
            return ctx.reply("Дата указана неверно. Введите в формате ДД.ММ.ГГГГ, например: 25.12.1990");
        }

        ctx.session.data.birthday = birthday;
        ctx.session.step = "doctor"
        return ctx.reply("Введите имя доктора")
    }

    if (step === "doctor") {
        ctx.session.data.doctor = text;

        const { city, address, name, phone, birthday, doctor } = ctx.session.data;

        const result = `📄 Пациент добавлен:
Город: ${city}
Адрес: ${address}
Имя: ${name || "Не указано"}
Телефон: ${phone}
День рождения: ${birthday || "Не указано"}
Доктор: ${doctor}`;

        await savePatient({
            city: city,
            address: address,
            name: name || "Не указано",
            phone: phone,
            birthday: birthday,
            doctor: doctor
        })

        await ctx.reply(result);

        // Сброс сессии
        ctx.session = { step: "city", data: {} };
        return ctx.reply("Хотите добавить ещё одного пациента? Выберите город:", {
            reply_markup: cityKeyboard,
        });
    }
});

bot.start();
