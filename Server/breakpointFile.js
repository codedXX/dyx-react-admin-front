import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 8101
const CHUNK_DIR = path.join(__dirname, './chunktemp') // 分片临时存储目录
const FILE_INFO_DIR = path.join(__dirname, './filetemp') // 文件上传进度信息目录
const TEST_FILE_INFO_DIR = path.join(__dirname, './test')
const FILE_DIR = path.join(__dirname, './file') // 最终合并文件存储目录
const FIELD_NAME = 'file' // 上传文件的表单字段名
//跨域
app.use(cors())
// 关键：添加 JSON 解析中间件（必须放在所有接口定义之前）
app.use(express.json())

/**
 * multer.diskStorage(...)
 * 意思是：
 * 使用“磁盘存储”方式
 * 文件会直接写入硬盘（不是内存）
 * ⚠️ 大文件 / 分片上传 必须用 diskStorage。
 */

const storage = multer.diskStorage({
  /**
   * uploadDir：你定义的上传目录
   * cb(null, uploadDir)：
   *  1.第一个参数 null = 没有错误
   *  2.第二个参数 = 保存路径
   * 等价于：把文件存到 uploadDir 文件夹
   */
  destination(req, file, cb) {
    cb(null, CHUNK_DIR)
  },
  /**
   * 决定文件在磁盘上的文件名
   * 这里你做了三件事：
   *  1.不用原始文件名
   *  2.用时间戳
   *  3.再加随机数
   * 目的只有一个：保证每个分片文件名绝对不重复，比如：文件名为1704960000000-0.384726
   */
  filename(req, file, cb) {
    // 临时文件名
    cb(null, Date.now() + '-' + Math.random())
  }
})

const upload = multer({ storage })

const exists = async filePath => {
  try {
    await fs.promises.stat(filePath) //尝试获取文件状态
    return true //成功泽文件存在
  } catch {
    return false //失败则文件不存在
  }
}

const getFileInfo = async fileId => {
  const infoPath = path.join(FILE_INFO_DIR, fileId) //构建信息文件路径
  if (!(await exists(infoPath))) return null

  const json = await fs.promises.readFile(infoPath, 'utf-8') //读取JSON文件内容
  return JSON.parse(json) //解析并返回对象
}

/**
 * 保存/更新文件上传进度信息
 * @param {*} fileId
 * @param {*} ext
 * @param {*} chunkIds
 * @param {*} needs
 */
const saveFileInfo = async (fileId, ext, chunkIds, needs = chunkIds) => {
  const infoPath = path.join(FILE_INFO_DIR, fileId) //构建信息文件路径
  const testPath = path.join(TEST_FILE_INFO_DIR, fileId)
  const info = { id: fileId, ext, chunkIds, needs }
  await fs.promises.writeFile(infoPath, JSON.stringify(info), 'utf-8') //写入JSON文件
  await fs.promises.writeFile(testPath, JSON.stringify(info), 'utf-8')
}

/**
 * 删除分片文件
 * @param {object} file - multer 上传的文件对象
 * @returns {Promise<void>}
 */
const deleteChunk = async file => {
  if (!file || !file.path) return
  try {
    // 异步删除文件
    await fs.promises.unlink(file.path)
    console.log(`已删除临时分片: ${file.path}`)
  } catch (err) {
    console.error(`删除分片失败: ${file.path}`, err)
  }
}

app.post('/api/upload/handshake', (req, res) => {
  const fileInfo = req.body
  const { fileId, ext, chunkIds } = fileInfo
  // console.log('接受的信息', fileInfo)接受的信息', fileInfo)
  if (!fileId) {
    res.json({
      code: 403,
      msg: '请携带文件编号',
      data: null
    })
  }
  if (!ext) {
    res.json({
      code: 403,
      msg: '请携带文件后缀，例如 .mp4',
      data: null
    })
  }
  if (!chunkIds) {
    res.json({
      code: 403,
      msg: '请按顺序设置文件的分片编号数组',
      data: null
    })
  }
  saveFileInfo(fileId, ext, chunkIds)
  res.json({
    code: 0,
    msg: '开始上传',
    data: chunkIds
  })
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('body', req.body)
  console.log('file', req.file)
  const { fileId, chunkId } = req.body
  const file = req.file

  // 参数校验
  if (!file) return res.send({ code: 403, msg: '请携带分片文件', data: null })
  if (!chunkId) return (deleteChunk(file.path), res.send({ code: 403, msg: '请携带分片编号', data: null }))
  if (!fileId) return (deleteChunk(file.path), res.send({ code: 403, msg: '请携带文件编号', data: null }))

  try {
    // 检查是否有上传记录（断点续传）
    const fileInfo = getFileInfo(fileId)
    if (!fileInfo) {
      deleteChunk(file.path)
      throw new Error('请先调用握手接口提交文件分片信息')
    }
    // 验证该分片是否属于此文件
    if (!fileInfo.chunkIds.includes(chunkId)) {
      deleteChunk(file.path)
      throw new Error('该文件没有此分片信息')
    }
    // 检查该分片是否已上传
    if (!fileInfo.needs.includes(chunkId)) {
      deleteChunk(file.path)
      // 分片已上传，直接返回剩余需要的分片
      return res.send({ code: 0, msg: '该分片已上传', data: fileInfo.needs })
    }
    //保存分片到chuktemp目录
    // const chunkPath = path.join(CHUNK_DIR, chunkId)
    // if (!(await exists(chunkPath))) {

    // }

    //修改文件命名
    const oldPath = file.path
    const newFilename = chunkId
    // console.log('newFilename', newFilename)
    const newPath = path.join(CHUNK_DIR, newFilename)
    /**
         * fs.renameSync(oldPath, newPath);
              把 multer 临时文件改成正式名字
              为什么要改？
              保证每片文件不会冲突
              后面 merge 时按序号拼接
              renameSync 是同步操作，保证改名完成再继续
         */
    fs.renameSync(oldPath, newPath)

    // 更新文件信息，移除已上传的分片 ID
    fileInfo.needs = fileInfo.needs.filter(id => id !== chunkId)
    await saveFileInfo(fileId, fileInfo.ext, fileInfo.chunkIds, fileInfo.needs)

    // 检查是否所有分片都已上传
    if (fileInfo.needs.length === 0) {
      // 全部完成，合并分片
      // await combineChunks(fileInfo)
      return res.send({ code: 0, msg: '上传完成', data: [] })
    }

    // 返回还需要上传的分片列表
    res.send({ code: 0, msg: '分片上传成功', data: fileInfo.needs })
  } catch (err) {
    res.send({ code: 403, msg: err.message, data: null })
  }
})

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})
