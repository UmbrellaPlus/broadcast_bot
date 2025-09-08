const { Pool } = require("pg");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

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

// ✅ Функция экспорта пациентов по городу в Excel
async function exportPatientsByCity(city) {
    try {
        const result = await pool.query("SELECT * FROM patients WHERE city = $1", [city]);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Пациенты из ${city}`);

        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Город", key: "city", width: 15 },
            { header: "Адрес", key: "address", width: 20 },
            { header: "Имя", key: "name", width: 20 },
            { header: "Телефон", key: "phone", width: 15 },
            { header: "День рождения", key: "birthday", width: 15 },
            { header: "Доктор", key: "doctor", width: 20 },
            { header: "Дата добавления", key: "created_at", width: 20 },
        ];

        result.rows.forEach(row => worksheet.addRow(row));

        const fileName = `patients_${city}_${Date.now()}.xlsx`;
        const exportDir = path.join(__dirname, "exports");
        const filePath = path.join(exportDir, fileName);

        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        await workbook.xlsx.writeFile(filePath);
        console.log(`✅ Файл экспортирован: ${filePath}`);
        return filePath;

    } catch (err) {
        console.error("❌ Ошибка при экспорте:", err.message);
        throw err;
    }
}

// Экспортируем обе функции
module.exports = {
    savePatient,
    exportPatientsByCity,
};
