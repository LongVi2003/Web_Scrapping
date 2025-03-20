const { Connection, Request, TYPES } = require("tedious");
const fs = require("fs").promises;

// Cấu hình kết nối
const config = {
  server: "localhost\\SQLEXPRESS",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "NewPassword123",
    },
  },
  options: {
    database: "WebScrapedData",
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 60000,
    instanceName: "SQLEXPRESS",
  },
};

// Hàm xử lý xóa và chèn dữ liệu
async function insertData() {
  let connection = null;
  try {
    const jsonData = await fs.readFile("scraped_data.json", "utf8");
    const data = JSON.parse(jsonData);

    connection = new Connection(config);

    await new Promise((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) reject(err);
        else {
          console.log("Kết nối thành công!");
          resolve();
        }
      });
      connection.connect();
    });

    // Xử lý từng bản ghi
    for (const item of data) {
      await new Promise((resolve, reject) => {
        const request = new Request(
          `IF EXISTS (SELECT 1 FROM BiddingPackages WHERE Code = @Code)
           BEGIN
             UPDATE BiddingPackages 
             SET Name = @Name,
                 Status = @Status,
                 Bidder = @Bidder,
                 Investor = @Investor,
                 PublishDate = @PublishDate,
                 Field = @Field,
                 Location = @Location,
                 ClosingTime = @ClosingTime,
                 ClosingDate = @ClosingDate,
                 BidType = @BidType,
                 DetailLink = @DetailLink
             WHERE Code = @Code
           END
           ELSE
           BEGIN
             INSERT INTO BiddingPackages 
             (Code, Name, Status, Bidder, Investor, PublishDate,
              Field, Location, ClosingTime, ClosingDate, BidType, DetailLink)
             VALUES 
             (@Code, @Name, @Status, @Bidder, @Investor, @PublishDate,
              @Field, @Location, @ClosingTime, @ClosingDate, @BidType, @DetailLink)
           END`,
          (err) => {
            if (err) {
              console.error(`Lỗi khi xử lý mã ${item.code}:`, err);
              resolve(); // Tiếp tục với bản ghi tiếp theo
            } else {
              console.log(`Đã xử lý: ${item.code}`);
              resolve();
            }
          }
        );

        // Thêm parameters
        request.addParameter("Code", TYPES.NVarChar, item.code);
        request.addParameter("Name", TYPES.NVarChar, item.name);
        request.addParameter("Status", TYPES.NVarChar, item.status);
        request.addParameter("Bidder", TYPES.NVarChar, item.bidder);
        request.addParameter("Investor", TYPES.NVarChar, item.investor);
        request.addParameter("PublishDate", TYPES.NVarChar, item.publishDate);
        request.addParameter("Field", TYPES.NVarChar, item.field);
        request.addParameter("Location", TYPES.NVarChar, item.location);
        request.addParameter("ClosingTime", TYPES.NVarChar, item.closingTime);
        request.addParameter("ClosingDate", TYPES.NVarChar, item.closingDate);
        request.addParameter("BidType", TYPES.NVarChar, item.bidType);
        request.addParameter("DetailLink", TYPES.NVarChar, item.detailLink);

        connection.execSql(request);
      });
    }

    console.log("Hoàn tất xử lý dữ liệu!");
  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

// Chạy chương trình
insertData().catch((err) => {
  console.error("Lỗi chương trình:", err);
});
