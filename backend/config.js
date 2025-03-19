const browserConfig = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--disable-web-security",
    "--ignore-certificate-errors",
  ],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
};

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
const baseUrl =
  "https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index";

module.exports = {
  browserConfig,
  userAgent,
  baseUrl,
};
