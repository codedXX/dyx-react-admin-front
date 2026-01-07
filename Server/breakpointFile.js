import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8101;
//跨域
app.use(cors());

app.post("/api/upload/handshake", (req, res) => {
  const fileInfo = req.body;
  console.log("接受的信息", fileInfo);
  res.json({
    message: "你好",
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
