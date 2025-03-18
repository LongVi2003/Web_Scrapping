const fs = require("fs").promises;
const path = require("path");

async function saveToJson(data, filename = "scraped_data.json") {
  try {
    const filePath = path.join(__dirname, filename);
    let existingData = [];

    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) {
        existingData = [];
      }
    } catch (error) {
      console.log("Tạo file JSON mới");
    }

    const existingCodes = new Set(existingData.map((item) => item.code));
    const newData = data.filter((item) => !existingCodes.has(item.code));
    const combinedData = [...existingData, ...newData];

    combinedData.sort((a, b) => {
      const dateA = new Date(
        a.publishDate.split(" - ")[0].split("/").reverse().join("-")
      );
      const dateB = new Date(
        b.publishDate.split(" - ")[0].split("/").reverse().join("-")
      );
      return dateB - dateA;
    });

    await fs.writeFile(filePath, JSON.stringify(combinedData, null, 2), "utf8");

    await generateStats(combinedData);

    return { newRecords: newData.length, totalRecords: combinedData.length };
  } catch (error) {
    console.error("Lỗi khi lưu file:", error);
    throw error;
  }
}

async function generateStats(data) {
  const stats = {
    totalRecords: data.length,
    lastUpdate: new Date().toISOString(),
    bidTypes: {},
    fields: {},
    status: {},
  };

  data.forEach((item) => {
    stats.bidTypes[item.bidType] = (stats.bidTypes[item.bidType] || 0) + 1;
    stats.fields[item.field] = (stats.fields[item.field] || 0) + 1;
    stats.status[item.status] = (stats.status[item.status] || 0) + 1;
  });

  await fs.writeFile(
    path.join(__dirname, "stats.json"),
    JSON.stringify(stats, null, 2),
    "utf8"
  );
}

module.exports = { saveToJson };
