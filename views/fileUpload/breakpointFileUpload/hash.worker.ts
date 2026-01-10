// hash.worker.ts - 用于在 Web Worker 中计算文件分片的 MD5 哈希
import SparkMD5 from 'spark-md5'

// Worker 消息类型定义
interface WorkerMessage {
  type: 'start'
  file: File
  chunkSize: number
}

interface ProgressMessage {
  type: 'progress'
  percent: number
  currentChunk: number
  totalChunks: number
}

interface ChunkMessage {
  type: 'chunk'
  chunkIndex: number
  chunkMD5: string
  content: ArrayBuffer
}

interface CompleteMessage {
  type: 'complete'
  fileId: string
  chunks: Array<{ id: string; content: ArrayBuffer }>
}

interface ErrorMessage {
  type: 'error'
  message: string
}

// 监听主线程消息
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, file, chunkSize } = e.data

  if (type !== 'start') return

  try {
    const chunks: Array<{ id: string; content: ArrayBuffer }> = []
    const totalChunks = Math.ceil(file.size / chunkSize)
    const fileSpark = new SparkMD5.ArrayBuffer() // 用于计算整个文件的 MD5

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      // 读取分片为 ArrayBuffer
      const buffer = await chunk.arrayBuffer()

      // 计算分片 MD5
      const chunkMD5 = SparkMD5.ArrayBuffer.hash(buffer) + i

      // 累加到文件 MD5 计算
      fileSpark.append(buffer)

      // 保存分片信息
      chunks.push({
        id: chunkMD5,
        content: buffer
      })

      // 发送进度消息
      const progressMsg: ProgressMessage = {
        type: 'progress',
        percent: Math.round(((i + 1) / totalChunks) * 100),
        currentChunk: i + 1,
        totalChunks
      }
      self.postMessage(progressMsg)
    }

    // 计算完成，发送结果
    const fileId = fileSpark.end()
    const completeMsg: CompleteMessage = {
      type: 'complete',
      fileId,
      chunks
    }
    self.postMessage(completeMsg)
  } catch (err) {
    const errorMsg: ErrorMessage = {
      type: 'error',
      message: err instanceof Error ? err.message : '计算 MD5 失败'
    }
    self.postMessage(errorMsg)
  }
}

export {}
