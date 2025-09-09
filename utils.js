const { getPatientsByCity } = require("./db")
const  sendSMS  = require("./broadcast")

async function sendMessages(city) {
    const patients = await getPatientsByCity(city)
    for (const patient of patients) {
        await sendSMS(patient.phone, "test_test_test")
    }
}

module.exports = sendMessages