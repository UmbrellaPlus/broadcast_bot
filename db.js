const { Pool } = require("pg");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const { InputFile } = require("grammy");

// Подключение к PostgreSQL (можно заменить на переменные окружения)
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Satellite98-", // <-- замени на свой пароль
    database: "patients", // <-- замени на свою базу
});

// ✅ Функция сохранения пациента в базу
async function savePatient(patient) {
    const { city, address, name, phone, birthday, doctor } = patient;

    try {
        await pool.query(
            `INSERT INTO patients (city, address, name, phone, birthday, doctor)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [city, address, name, phone, birthday, doctor]
        );

        console.log("✅ Пациент успешно сохранён.");
    } catch (err) {
        console.error("❌ Ошибка при сохранении пациента:", err.message);
        throw err;
    }
}

async function getPatientsByCity(city) {
    try {
        const result = await pool.query("SELECT * FROM patients WHERE city = $1", [city]);
        return result.rows;
    } catch (err) {
        console.error("❌ Ошибка при получении пациентов:", err.message);
        throw err;
    }
}

async function exportPatientsByCity(ctx, city) {
    try {
        const result = await getPatientsByCity(city)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Пациенты из ${city}`);

        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Город", key: "city", width: 15 },
            { header: "Адрес", key: "address", width: 20 },
            { header: "Имя", key: "name", width: 20 },
            { header: "Телефон", key: "phone", width: 15 },
            { header: "День рождения", key: "birthday", width: 15, style: { numFmt: 'dd.mm.yyyy' } },
            { header: "Доктор", key: "doctor", width: 20 },
            { header: "Дата добавления", key: "created_at", width: 20, style: { numFmt: 'dd.mm.yyyy HH:mm:ss' } },
        ];

        // Преобразуем даты в объекты Date, если это строки
        result.forEach(row => {
            if (row.birthday) row.birthday = new Date(row.birthday);
            if (row.created_at) row.created_at = new Date(row.created_at);
            worksheet.addRow(row);
        });

        // Создаём файл в памяти
        const buffer = await workbook.xlsx.writeBuffer();

        // Имя файла
        const fileName = `patients_${city}_${Date.now()}.xlsx`;

        // Отправляем файл в чат
        await ctx.replyWithDocument(
            new InputFile(Buffer.from(buffer), fileName),
            {
                caption: `📄 Экспорт пациентов из города "${city}"`,
            }
        );

        console.log("✅ Файл отправлен в чат");

    } catch (err) {
        console.error("❌ Ошибка при экспорте:", err.message);
        await ctx.reply("Произошла ошибка при экспорте файла.");
    }
}

module.exports = {
    savePatient,
    exportPatientsByCity,
    getPatientsByCity
};
