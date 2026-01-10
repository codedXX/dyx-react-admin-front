import { UploadOutlined } from '@ant-design/icons'
import { Button, message, Upload, Progress, Card, Typography } from 'antd'
import axios from 'axios'
import { useState, useRef, useCallback, useEffect } from 'react'

const { Text } = Typography

// 分片大小：2MB
const CHUNK_SIZE = 2 * 1024 * 1024

// API 地址
const API_BASE = 'http://localhost:8101'

// Worker 消息类型
interface ProgressMessage {
  type: 'progress'
  percent: number
  currentChunk: number
  totalChunks: number
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

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage

export default () => {
  // 状态管理
  const [hashProgress, setHashProgress] = useState(0) // MD5 计算进度
  const [uploadProgress, setUploadProgress] = useState(0) // 上传进度
  const [status, setStatus] = useState<'idle' | 'hashing' | 'uploading' | 'success' | 'error'>('idle')
  const [statusText, setStatusText] = useState('')

  // 使用 ref 存储上传相关数据
  const workerRef = useRef<Worker | null>(null)
  const chunksRef = useRef<Array<{ id: string; content: ArrayBuffer }>>([])
  const fileIdRef = useRef<string>('')
  const needsRef = useRef<string[]>([])
  const fileExtRef = useRef<string>('')

  // 组件卸载时清理 Worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  /**
   * 使用 Web Worker 计算文件分片和 MD5
   */
  const calculateHash = useCallback(
    (file: File): Promise<{ fileId: string; chunks: Array<{ id: string; content: ArrayBuffer }> }> => {
      return new Promise((resolve, reject) => {
        // 创建 Worker
        const worker = new Worker(new URL('./hash.worker.ts', import.meta.url), { type: 'module' })
        workerRef.current = worker

        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
          const { type } = e.data

          if (type === 'progress') {
            const { percent, currentChunk, totalChunks } = e.data as ProgressMessage
            setHashProgress(percent)
            setStatusText(`正在计算 MD5：${currentChunk}/${totalChunks} 分片`)
          } else if (type === 'complete') {
            const { fileId, chunks } = e.data as CompleteMessage
            worker.terminate()
            workerRef.current = null
            resolve({ fileId, chunks })
          } else if (type === 'error') {
            const { message: errorMsg } = e.data as ErrorMessage
            worker.terminate()
            workerRef.current = null
            reject(new Error(errorMsg))
          }
        }

        worker.onerror = err => {
          worker.terminate()
          workerRef.current = null
          reject(new Error(err.message))
        }

        // 发送计算任务
        worker.postMessage({
          type: 'start',
          file,
          chunkSize: CHUNK_SIZE
        })
      })
    },
    []
  )

  /**
   * 握手接口 - 获取需要上传的分片列表
   */
  const handleShake = async (fileId: string, ext: string, chunkIds: string[]) => {
    const res = await axios.post(`${API_BASE}/api/upload/handshake`, {
      fileId,
      ext,
      chunkIds
    })
    return res.data
  }

  /**
   * 上传单个分片
   */
  const uploadChunk = async (chunkId: string, content: ArrayBuffer, fileId: string) => {
    const fd = new FormData()
    fd.append('file', new Blob([content]))
    fd.append('chunkId', chunkId)
    fd.append('fileId', fileId)

    const res = await axios.post(`${API_BASE}/api/upload/`, fd)
    return res.data
  }

  /**
   * 递归上传所有分片
   */
  const uploadAllChunks = async () => {
    const needs = needsRef.current
    const chunks = chunksRef.current
    const fileId = fileIdRef.current
    const totalChunks = chunks.length

    if (needs.length === 0) {
      setUploadProgress(100)
      setStatus('success')
      setStatusText('上传完成！')
      message.success('文件上传成功！')
      return
    }

    const chunkId = needs[0]
    const chunk = chunks.find(c => c.id === chunkId)

    if (!chunk) {
      throw new Error(`找不到分片: ${chunkId}`)
    }

    try {
      const result = await uploadChunk(chunkId, chunk.content, fileId)

      if (result.code === 0) {
        needsRef.current = result.data
        const uploaded = totalChunks - result.data.length
        setUploadProgress(Math.round((uploaded / totalChunks) * 100))
        setStatusText(`正在上传：${uploaded}/${totalChunks} 分片`)

        // 递归上传下一个分片
        await uploadAllChunks()
      } else {
        throw new Error(result.msg)
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * 自定义上传处理
   */
  const customUpload = async (options: any) => {
    const file = options.file as File

    try {
      // 重置状态
      setStatus('hashing')
      setHashProgress(0)
      setUploadProgress(0)
      setStatusText('开始计算文件 MD5...')

      // 1. 使用 Worker 计算 MD5
      const { fileId, chunks } = await calculateHash(file)

      // 保存数据到 ref
      chunksRef.current = chunks
      fileIdRef.current = fileId
      fileExtRef.current = '.' + file.name.split('.').pop()

      console.log('文件 MD5:', fileId)
      console.log('分片数量:', chunks.length)

      // 2. 握手 - 获取需要上传的分片
      setStatus('uploading')
      setStatusText('正在与服务器握手...')

      const handshakeResult = await handleShake(
        fileId,
        fileExtRef.current,
        chunks.map(c => c.id)
      )

      if (handshakeResult.code !== 0 && handshakeResult.msg !== '开始上传' && handshakeResult.msg !== '继续上传') {
        // 秒传成功
        if (handshakeResult.msg === '秒传成功') {
          setStatus('success')
          setUploadProgress(100)
          setStatusText('秒传成功！')
          message.success('文件秒传成功！')
          options.onSuccess && options.onSuccess(handshakeResult, file)
          return
        }
      }

      needsRef.current = handshakeResult.data

      // 3. 上传分片
      if (needsRef.current.length === 0) {
        // 所有分片已上传
        setStatus('success')
        setUploadProgress(100)
        setStatusText('文件已存在，秒传成功！')
        message.success('文件秒传成功！')
      } else {
        await uploadAllChunks()
      }

      options.onSuccess && options.onSuccess({}, file)
    } catch (err: any) {
      console.error('上传失败:', err)
      setStatus('error')
      setStatusText(`上传失败: ${err.message}`)
      message.error(`上传失败: ${err.message}`)
      options.onError && options.onError(err)
    }
  }

  // 根据状态获取进度条颜色
  const getProgressStatus = () => {
    switch (status) {
      case 'success':
        return 'success'
      case 'error':
        return 'exception'
      default:
        return 'active'
    }
  }

  return (
    <Card title='断点续传上传（Web Worker 优化）' style={{ maxWidth: 600 }}>
      <Upload customRequest={customUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />} disabled={status === 'hashing' || status === 'uploading'}>
          {status === 'idle' ? '选择文件' : status === 'hashing' || status === 'uploading' ? '上传中...' : '重新上传'}
        </Button>
      </Upload>

      {status !== 'idle' && (
        <div style={{ marginTop: 20 }}>
          {/* MD5 计算进度 */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>MD5 计算进度：</Text>
            <Progress
              percent={hashProgress}
              status={status === 'hashing' ? 'active' : hashProgress === 100 ? 'success' : 'normal'}
              size='small'
            />
          </div>

          {/* 上传进度 */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>上传进度：</Text>
            <Progress percent={uploadProgress} status={getProgressStatus()} size='small' />
          </div>

          {/* 状态文字 */}
          <Text type={status === 'error' ? 'danger' : status === 'success' ? 'success' : 'secondary'}>
            {statusText}
          </Text>
        </div>
      )}
    </Card>
  )
}
