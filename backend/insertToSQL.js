const sql = require("mssql");
const fs = require("fs").promises;

const config = {
  server: "127.0.0.1",
  database: "WebScrapedData",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "...",
    },
  },
  options: {
    port: 1433,
    encrypt: false,
    trustServerCertificate: true,
    instanceName: "SQLEXPRESS",
    connectTimeout: 30000,
  },
};

async function insertData() {
  try {
    // Đọc file JSON
    const jsonData = await fs.readFile("scraped_data.json", "utf8");
    const data = JSON.parse(jsonData);

    // Kết nối SQL Server
    let pool = await sql.connect(config);

    // Chèn từng dòng dữ liệu
    for (let item of data) {
      await pool
        .request()
        .input("code", sql.NVarChar, item.code)
        .input("name", sql.NVarChar, item.name)
        .input("status", sql.NVarChar, item.status)
        .input("bidder", sql.NVarChar, item.bidder)
        .input("investor", sql.NVarChar, item.investor)
        .input("publishDate", sql.NVarChar, item.publishDate)
        .input("field", sql.NVarChar, item.field)
        .input("location", sql.NVarChar, item.location)
        .input("closingTime", sql.NVarChar, item.closingTime)
        .input("closingDate", sql.NVarChar, item.closingDate)
        .input("bidType", sql.NVarChar, item.bidType)
        .input("detailLink", sql.NVarChar, item.detailLink).query(`
                    INSERT INTO BiddingPackages (
                        Code, Name, Status, Bidder, Investor, PublishDate, 
                        Field, Location, ClosingTime, ClosingDate, BidType, DetailLink
                    ) 
                    VALUES (
                        @code, @name, @status, @bidder, @investor, @publishDate, 
                        @field, @location, @closingTime, @closingDate, @bidType, @detailLink
                    )
                `);
      console.log(`Inserted: ${item.name}`);
    }

    console.log("Hoàn tất chèn dữ liệu!");
    await pool.close();
  } catch (err) {
    console.error("Lỗi:", err);
  }
}

insertData();
