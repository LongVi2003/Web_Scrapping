const puppeteer = require("puppeteer");
const { browserConfig, userAgent, baseUrl } = require("./config");
const { saveToJson } = require("./fileHandler");
const { extractPageData } = require("./dataExtractor");

async function scrapeData() {
  let browser;
  try {
    browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    console.log("Đang truy cập trang web...");
    await page.goto(baseUrl);

    await page.waitForSelector(".content__body__left__item");

    const allData = [];
    let currentPage = 1;
    const totalPages = await page.evaluate(() => {
      const lastPageButton = document.querySelector(".el-pager li:last-child");
      return lastPageButton ? parseInt(lastPageButton.textContent) : 1;
    });

    console.log(`Tổng số trang: ${totalPages}`);

    while (currentPage <= totalPages) {
      console.log(`Đang lấy dữ liệu trang ${currentPage}/${totalPages}`);
      const pageData = await extractPageData(page);
      allData.push(...pageData);

      if (currentPage < totalPages) {
        await page.click(".btn-next");
        await new Promise((resolve) => setTimeout(resolve, 800));
        await page.waitForSelector(".content__body__left__item");
      }
      currentPage++;
    }

    const saveResult = await saveToJson(allData);
    console.log(`Đã lưu dữ liệu thành công:`);
    console.log(`- Bản ghi mới: ${saveResult.newRecords}`);
    console.log(`- Tổng số bản ghi: ${saveResult.totalRecords}`);

    return allData;
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeData };
