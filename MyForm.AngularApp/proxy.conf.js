module.exports = {
  "/api": {
    target:
      process.env["services__formapi__https__0"] ||
      process.env["services__formapi__http__0"],
    secure: process.env["NODE_ENV"] !== "development",
    // Keep /api prefix when forwarding to backend
  },
};
