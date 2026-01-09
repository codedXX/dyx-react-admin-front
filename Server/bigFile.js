import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 8100
//跨域
app.use(cors())
const uploadDir = path.resolve(__dirname, './uploads')
const uploadHost = `http://localhost:${port}/uploads/`
//确保目录存在
/**
当配置 { recursive: true } 时，fs.mkdirSync 会自动处理父目录不存在的情况：
1.先检查目标目录的所有父目录（从最外层到最内层）；
2.对不存在的父目录进行逐级自动创建；
3.最后创建目标目录（如果目标目录已存在，不会报错，也不会覆盖已有目录内容）。
 */
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

/**
 * multer 配置
 * 每个分片先用随机名存储，后面我们再 rename
 */

//规定：上传的文件存到哪一个目录、用什么文件名保存

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
    cb(null, uploadDir)
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
//👉 把服务器上的 uploadDir 文件夹，映射成一个可以通过 /uploads 这个 URL 访问的静态目录
app.use('/uploads', express.static(uploadDir))

// 接收 multipart/form-data
/**
 * upload.single('f1')的意思是:
 * 👉 告诉 multer：字段名为 f1 的文件单独处理，不放在 req.body，存到 req.file
 */
/**
为什么要把f1从body里拆分出来?

普通表单字段（token、index）：
只是一些小文本
可以直接解析成 req.body
内存占用几乎可以忽略
而文件字段（f1）：
可能 几十 MB / 几 GB
如果放在 req.body 里：
服务器必须先把整个文件读到内存里
占用大量 RAM
大文件甚至会让进程崩溃
所以 multer 的设计原则：
文件不经过 req.body，直接写入磁盘或内存流
 */
app.post('/', upload.single('f1'), (req, res) => {
  const body = req.body
  const file = req.file
  // console.log("body", body);
  // console.log("file", file);

  const token = body.token
  const index = body.index

  // ============ 普通分片上传 ============
  if (file) {
    const oldPath = file.path
    const newFilename = `${index}-${token}`
    console.log('newFilename', newFilename)
    const newPath = path.join(uploadDir, newFilename)
    /**
     * fs.renameSync(oldPath, newPath);
          把 multer 临时文件改成正式名字
          为什么要改？
          保证每片文件不会冲突
          后面 merge 时按序号拼接
          renameSync 是同步操作，保证改名完成再继续
     */
    fs.renameSync(oldPath, newPath)
    return res.json({
      fileUrl: [uploadHost + newFilename]
    })
  }
  // ============ 合并请求 ============
  if (body.type === 'merge') {
    const filename = body.filename
    const chunkCount = Number(body.chunkCount)

    const finalPath = path.join(uploadDir, filename)
    const writeStream = fs.createWriteStream(finalPath)

    let currentIndex = 0

    function mergeChunk() {
      const chunkPath = path.join(uploadDir, `${currentIndex}-${token}`)
      const readStream = fs.createReadStream(chunkPath)
      /**
       * readStream.pipe(writeStream)
       意思是：
        1.读到一块数据 → 立刻写进最终文件
        2.不经过 JS 内存缓冲
       */
      /**
       *  { end: false } 是重点
       * 如果不写{ end: false }的话，会发生
       * 1.当前分片读完
       * 2.Node 会自动执行：writeStream.end()
       * 3.最终文件被关闭
       * 4.下一个分片就没法再写了 ❌
       *
       * 所以 { end: false } 的意思是：
       * 1.当前分片写完了，但最终文件还没写完，先别关
       * 2.只有 最后一个分片 才能关。
       */
      readStream.pipe(writeStream, { end: false })
      /**
       * readStream.on('end', () => {
       * });
       * 一句话解释:👉 监听：当前这个分片“已经全部读完并写入完毕”
       *
       *
       * end 事件什么时候触发？
       * 当:
       * 1.当前分片文件所有字节全部被读完
       * 此时：
       * ✅ 当前分片 → 已经完整写进最终文件
       * ✅ 可以安全进行下一步操作
       */
      readStream.on('end', () => {
        //fs.unlinkSync(chunkPath)是 Node.js 文件系统（fs 模块）提供的同步删除文件的方法
        // fs.unlinkSync(chunkPath);
        currentIndex++
        if (currentIndex < chunkCount) {
          mergeChunk()
        } else {
          /**
           * 通过writeStream.end()手动关闭最终文件
           */
          writeStream.end()
          res.send('merge ok 200')
        }
      })
    }
    mergeChunk()
  }
})

// 启动服务
app.listen(port, () => {
  console.log('express upload server start on ' + port)
})
