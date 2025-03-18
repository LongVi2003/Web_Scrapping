const puppeteer = require("puppeteer");

async function scrapeData() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--disable-web-security",
        "--ignore-certificate-errors",
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      timeout: 120000,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    console.log("Đang truy cập trang web...");

    // Truy cập trang đầu tiên
    await page.goto(
      "https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index",
      {
        waitUntil: "networkidle2",
        timeout: 120000,
      }
    );

    // Đợi selector chính xuất hiện
    await page.waitForSelector(".content__body__left__item", {
      timeout: 120000,
    });

    const allData = [];
    let currentPage = 1;
    const totalPages = await page.evaluate(() => {
      const lastPageButton = document.querySelector(".el-pager li:last-child");
      return lastPageButton ? parseInt(lastPageButton.textContent) : 1;
    });

    // Giới hạn số trang cần lấy
    const pagesToScrape = 10; // Chỉ lấy 10 trang
    const maxPages = Math.min(pagesToScrape, totalPages); // Lấy số trang nhỏ nhất giữa 10 và tổng số trang thực tế

    console.log(`Tổng số trang: ${totalPages}`);
    console.log(`Số trang sẽ lấy: ${maxPages}`);

    // Vòng lặp chỉ chạy đến maxPages
    while (currentPage <= maxPages) {
      console.log(`Đang lấy dữ liệu trang ${currentPage}/${maxPages}`);

      // Lấy dữ liệu từ trang hiện tại
      const pageData = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(".content__body__left__item__infor")
        ).map((el) => {
            return el.innerText.trim();
          });
        });
  
        allData.push(...pageData);
  
        if (currentPage < maxPages) {
          // Click nút sang trang tiếp theo
          await page.click(".btn-next");
  
          // Đợi trang mới tải xong
          await page.evaluate(() => {
            return new Promise((resolve) => setTimeout(resolve, 2000));
          });
  
          await page.waitForSelector(".content__body__left__item", {
            timeout: 120000,
          });
        }
  
        currentPage++;
      }
  
      console.log(`Đã lấy được ${allData.length} bản ghi`);
      console.log(allData);
  
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
  
  // Chạy hàm scraping
  scrapeData().catch(console.error);