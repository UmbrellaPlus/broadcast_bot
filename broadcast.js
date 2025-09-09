const axios = require("axios");

// 🔐 Укажи свои данные
const TURBOSMS_TOKEN = "a9f0dbb73701d868cb011c5e245f0f01fe2eec48";
const SENDER_NAME = "Umbrella";

async function sendSMS(phone, message) {
    try {
        const response = await axios.post(
            "https://api.turbosms.ua/message/send.json",
            {
                recipients: [phone],
                sms: {
                    sender: SENDER_NAME,
                    text: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${TURBOSMS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ SMS отправлено:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Ошибка при отправке SMS:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = sendSMS;

// ✅ Пример использования:
// sendSMS("380500424807", "Привет! Это тестовое сообщение от твоего бота.");
