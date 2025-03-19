const { scrapeData } = require("./scraper");

console.log("Bắt đầu quá trình crawl dữ liệu...");
scrapeData()
  .then(() => console.log("Hoàn thành!"))
  .catch(console.error);
