function parseBirthday(text) {
    if (text.toLowerCase() === "пропустить") return null;

    const parts = text.trim().split(/[.\-/\\]/); // поддержка 25.12.1990, 25-12-1990, 25/12/1990
    if (parts.length !== 3) return null;

    let [day, month, year] = parts;

    // Приведение к числам и проверка
    day = parseInt(day, 10);
    month = parseInt(month, 10);
    year = parseInt(year, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    // Приведение к формату YYYY-MM-DD
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

module.exports = parseBirthday;
