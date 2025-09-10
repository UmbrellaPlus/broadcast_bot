const { getPatientsByCity } = require("./db")
const  sendSMS  = require("./broadcast")
const cron = require("node-cron");


async function sendMessages(city) {
    const patients = await getPatientsByCity(city)
    for (const patient of patients) {
        await sendSMS(patient.phone, "test_test_test")
    }
}

async function sendBirthdayMessages(city) {
    const patients = await getPatientsByCity(city);
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth(); // январь = 0

    for (const patient of patients) {
        if (patient.birthday) {
            const birthday = new Date(patient.birthday);
            // if (birthday.getDate() === todayDay && birthday.getMonth() === todayMonth) {
            //     await sendSMS(patient.phone, `Поздравляем с днём рождения! 🎉`);
            // }
            console.log(patient.birthday);

        }
    }
}

const cities = ["Киев", "Харьков", "Одесса", "Днепр", "Львов", "Запорожье"];

async function sendBirthdayMessagesForAllCities(){
    cron.schedule("0 13 * * *", async () => {
        for (const city of cities) {
            await sendBirthdayMessages(city);
        }
    });
}

module.exports = { sendMessages, sendBirthdayMessagesForAllCities }