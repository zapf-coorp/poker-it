import express from "express";

const app = express();
const parsedPort = parseInt(process.env.PORT ?? "", 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
