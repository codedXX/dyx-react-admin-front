import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8101
const CHUNK_DIR = path.join(__dirname, './chunktemp') // 分片临时存储目录
const FILE_INFO_DIR = path.join(__dirname, './filetemp') // 文件上传进度信息目录
const TEST_FILE_INFO_DIR = path.join(__dirname, './test')
const FILE_DIR = path.join(__dirname, './file') // 最终合并文件存储目录
const FIELD_NAME = 'file';


// ==================== 初始化目录 ====================
// 检查并创建必要的目录，确保服务器启动时目录存在
[CHUNK_DIR, FILE_INFO_DIR, FILE_DIR,TEST_FILE_INFO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    // 如果目录不存在
    fs.mkdirSync(dir); // 则创建该目录
  }
});

// ==================== 工具函数 ====================

/**
 * 异步检查文件/目录是否存在
 * @param {string} filePath - 要检查的路径
 * @returns {Promise<boolean>} - 存在返回 true，否则返回 false
 */
async function exists(filePath) {
  try {
    await fs.promises.stat(filePath); // 尝试获取文件状态
    return true; // 成功则文件存在
  } catch {
    return false; // 失败则文件不存在
  }
}

/**
 * 获取文件上传进度信息
 * @param {string} fileId - 文件唯一标识（通常是文件内容的 MD5）
 * @returns {Promise<object|null>} - 返回文件信息对象，不存在则返回 null
 */
async function getFileInfo(fileId) {
  const infoPath = path.join(FILE_INFO_DIR, fileId); // 构建信息文件路径
  if (!(await exists(infoPath))) {
    // 如果信息文件不存在
    return null; // 返回 null
  }
  const json = await fs.promises.readFile(infoPath, "utf-8"); // 读取 JSON 文件内容
  return JSON.parse(json); // 解析并返回对象
}

/**
 * 保存/更新文件上传进度信息
 * @param {string} fileId - 文件唯一标识
 * @param {string} ext - 文件扩展名（如 .zip, .mp4）
 * @param {string[]} chunkIds - 所有分片 ID 数组（按顺序）
 * @param {string[]} needs - 还需要上传的分片 ID 数组
 * @returns {Promise<object>} - 返回保存的文件信息对象
 */
async function saveFileInfo(fileId, ext, chunkIds, needs = chunkIds) {
  const infoPath = path.join(FILE_INFO_DIR, fileId); // 构建信息文件路径
  const testInfoPath=path.join(TEST_FILE_INFO_DIR, fileId);
  const info = { id: fileId, ext, chunkIds, needs }; // 构建信息对象
  await fs.promises.writeFile(infoPath, JSON.stringify(info), "utf-8"); // 写入 JSON 文件
  await fs.promises.writeFile(testInfoPath, JSON.stringify(info), "utf-8"); // 写入 JSON 文件
  return info; // 返回信息对象
}

/**
 * 合并所有分片为完整文件
 * @param {object} fileInfo - 文件信息对象
 */
async function combineChunks(fileInfo) {
  const targetPath = path.join(FILE_DIR, fileInfo.id) + fileInfo.ext; // 目标文件完整路径

  // 按顺序读取每个分片并追加到目标文件
  for (const chunkId of fileInfo.chunkIds) {
    const chunkPath = path.join(CHUNK_DIR, chunkId); // 分片文件路径
    const buffer = await fs.promises.readFile(chunkPath); // 读取分片内容
    await fs.promises.appendFile(targetPath, buffer); // 追加到目标文件
    // 注意：这里不再删除分片文件，保留在 chunktemp 目录中
  }

  // 删除文件进度信息（上传已完成，不再需要）
  await fs.promises.rm(path.join(FILE_INFO_DIR, fileInfo.id));
}

// ==================== Express 应用初始化 ====================
const app = express(); // 创建 Express 应用实例
app.use(cors()); // 启用 CORS，允许跨域请求
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体
app.use(express.json()); // 解析 JSON 格式的请求体
app.use("/upload", express.static(FILE_DIR)); // 静态文件服务，提供已上传文件的访问

// 配置 multer 使用内存存储（分片数据暂存于内存中）
const upload = multer({ storage: multer.memoryStorage() }).single(FIELD_NAME);

// ==================== API 路由 ====================

/**
 * 文件下载接口
 * GET /download/:filename
 * 用于下载 res 目录中的文件
 */
app.get("/download/:filename", (req, res) => {
  const filename = path.join(__dirname, "./res", req.params.filename); // 构建文件路径
  res.download(filename, req.params.filename); // 发送文件下载响应
});

/**
 * 握手接口 - 上传前的准备工作
 * POST /api/upload/handshake
 * 请求体: { fileId: string, ext: string, chunkIds: string[] }
 *
 * 功能：
 * 1. 秒传检测：如果文件已存在，直接返回文件 URL
 * 2. 断点续传：如果有上传记录，返回还需要上传的分片列表
 * 3. 新文件：创建上传记录，返回所有分片列表
 */
app.post("/api/upload/handshake", async (req, res) => {
  const { fileId, ext, chunkIds } = req.body; // 解构请求参数

  // 参数校验
  if (!fileId)
    return res.send({ code: 403, msg: "请携带文件编号", data: null });
  if (!ext)
    return res.send({
      code: 403,
      msg: "请携带文件后缀，例如 .mp4",
      data: null,
    });
  if (!chunkIds)
    return res.send({
      code: 403,
      msg: "请按顺序设置文件的分片编号数组",
      data: null,
    });

  // 检查文件是否已经存在（秒传）
  const filePath = path.join(FILE_DIR, fileId) + ext;
  if (await exists(filePath)) {
    // 文件已存在，直接返回访问 URL（秒传成功）
    const url = `${req.protocol}://${req.hostname}:${PORT}/upload/${fileId}${ext}`;
    return res.send({ code: 0, msg: "秒传成功", data: url });
  }

  // 检查是否有上传记录（断点续传）
  const fileInfo = await getFileInfo(fileId);
  if (fileInfo) {
    // 有记录，返回还需要上传的分片列表
    return res.send({ code: 0, msg: "继续上传", data: fileInfo.needs });
  }

  // 新文件，创建上传记录
  const newInfo = await saveFileInfo(fileId, ext, chunkIds);
  res.send({ code: 0, msg: "开始上传", data: newInfo.needs });
});

/**
 * 分片上传接口
 * POST /api/upload
 * 请求体: FormData { file: Blob, chunkId: string, fileId: string }
 *
 * 功能：接收并保存单个分片，当所有分片上传完成后自动合并
 */
app.post("/api/upload", upload, async (req, res) => {
  const { chunkId, fileId } = req.body; // 解构请求参数
  const chunkBuffer = req.file?.buffer; // 获取上传的分片数据

  // 参数校验
  if (!chunkId)
    return res.send({ code: 403, msg: "请携带分片编号", data: null });
  if (!fileId)
    return res.send({ code: 403, msg: "请携带文件编号", data: null });
  if (!chunkBuffer)
    return res.send({ code: 403, msg: "请携带分片文件", data: null });

  try {
    // 获取文件信息
    let fileInfo = await getFileInfo(fileId);
    if (!fileInfo) {
      throw new Error("请先调用握手接口提交文件分片信息");
    }

    // 验证该分片是否属于此文件
    if (!fileInfo.chunkIds.includes(chunkId)) {
      throw new Error("该文件没有此分片信息");
    }

    // 检查该分片是否已上传
    if (!fileInfo.needs.includes(chunkId)) {
      // 分片已上传，直接返回剩余需要的分片
      return res.send({ code: 0, msg: "该分片已上传", data: fileInfo.needs });
    }

    // 保存分片到 chunktemp 目录
    const chunkPath = path.join(CHUNK_DIR, chunkId);
    if (!(await exists(chunkPath))) {
      // 如果分片文件不存在
      await fs.promises.writeFile(chunkPath, chunkBuffer); // 写入分片文件
    }

    // 更新文件信息，移除已上传的分片 ID
    fileInfo.needs = fileInfo.needs.filter((id) => id !== chunkId);
    await saveFileInfo(fileId, fileInfo.ext, fileInfo.chunkIds, fileInfo.needs);

    // 检查是否所有分片都已上传
    if (fileInfo.needs.length === 0) {
      // 全部完成，合并分片
      await combineChunks(fileInfo);
      return res.send({ code: 0, msg: "上传完成", data: [] });
    }

    // 返回还需要上传的分片列表
    res.send({ code: 0, msg: "分片上传成功", data: fileInfo.needs });
  } catch (err) {
    res.send({ code: 403, msg: err.message, data: null });
  }
});

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
  console.log(`🚀 断点续传服务器已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`📁 分片目录: ${CHUNK_DIR}`);
  console.log(`📋 进度目录: ${FILE_INFO_DIR}`);
  console.log(`📦 文件目录: ${FILE_DIR}`);
});
