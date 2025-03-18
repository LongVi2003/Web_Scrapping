async function extractPageData(page) {
  return await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".content__body__left__item")
    ).map((el) => {
      const contractOtherElements = el.querySelectorAll(
        ".content__body__left__item__infor__contract__other h6"
      );

      let bidder = "",
        investor = "",
        publishDate = "",
        field = "",
        location = "";

      contractOtherElements.forEach((h6) => {
        const text = h6.textContent.trim();
        const spanContent = h6.querySelector("span")?.textContent.trim() || "";

        if (text.includes("Bên mời thầu")) {
          bidder = spanContent;
        } else if (text.includes("Chủ đầu tư")) {
          investor = spanContent;
        } else if (text.includes("Ngày đăng tải")) {
          publishDate = spanContent;
        } else if (text.includes("Lĩnh vực")) {
          field = spanContent;
        } else if (text.includes("Địa điểm")) {
          location = spanContent.replace(/;$/, "").trim();
        }
      });

      const rightInfoContainer = el.querySelector(
        ".content__body__right__item__infor__contract"
      );
      const timeElements = rightInfoContainer.querySelectorAll("h5");

      return {
        code:
          el
            .querySelector(".content__body__left__item__infor__code")
            ?.textContent.replace(/Mã TBMT\s*:\s*/g, "")
            .replace(/\s+/g, " ")
            .trim() || "",
        name:
          el
            .querySelector(".content__body__left__item__infor__contract__name")
            ?.textContent.trim() || "",
        status:
          el
            .querySelector(".content__body__left__item__infor__notice--be")
            ?.textContent.trim() || "",
        bidder,
        investor,
        publishDate,
        field,
        location,
        closingTime: timeElements[0]?.textContent.trim() || "",
        closingDate: timeElements[1]?.textContent.trim() || "",
        bidType: timeElements[2]?.textContent.trim() || "",
        detailLink:
          el.querySelector(".content__body__left__item__infor__contract a")
            ?.href || "",
      };
    });
  });
}

module.exports = { extractPageData };
