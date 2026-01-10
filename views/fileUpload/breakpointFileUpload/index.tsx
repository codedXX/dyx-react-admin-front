import SparkMD5 from 'spark-md5'
import axios from 'axios'
import { useRef, useState } from 'react'

export default function NativeChunkUpload() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [uploadLink, setUploadLink] = useState<string | null>(null) // 新增：显示完成链接
  const chunksListRef = useRef<{ id: string; content: Blob }[]>([])
  const fileIdRef = useRef<string>('')
  const needsRef = useRef<string[]>([])
  const totalChunksRef = useRef(0)

  const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

  const getFileChunks = (file: File): Blob[] => {
    const chunks: Blob[] = []
    let start = 0
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size)
      chunks.push(file.slice(start, end))
      start = end
    }
    return chunks
  }

  const splitFileAndCalculateHash = async (file: File): Promise<{
    fileId: string
    ext: string
    chunks: { id: string; content: Blob }[]
  }> => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()
      const chunks: { id: string; content: Blob }[] = []
      let chunkIndex = 0

      fileReader.onload = (e) => {
        const result = e.target?.result as ArrayBuffer | null
        if (!result) return reject(new Error('读取分片失败'))

        const chunkHash = SparkMD5.ArrayBuffer.hash(result) + chunkIndex
        chunkIndex++

        spark.append(result)
        chunks.push({ id: chunkHash, content: new Blob([result]) })

        if (chunkIndex < totalChunksRef.current) {
          loadNext()
        } else {
          const fileId = spark.end()
          fileIdRef.current = fileId
          chunksListRef.current = chunks
          resolve({
            fileId,
            ext: file.name.split('.').pop() || '',
            chunks
          })
        }
      }

      fileReader.onerror = reject

      const loadNext = () => {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        fileReader.readAsArrayBuffer(file.slice(start, end))
      }

      totalChunksRef.current = getFileChunks(file).length
      loadNext()
    })
  }

  const handshake = async (fileInfo: { fileId: string; ext: string; chunkIds: string[] }) => {
    try {
      const res = await axios.post('http://localhost:8101/api/upload/handshake', fileInfo)
      console.log('握手响应:', res.data) // 新增：打印响应到控制台，便于查看
      return res.data
    } catch (err) {
      console.error('握手失败:', err)
      throw new Error('握手失败')
    }
  }

  const uploadChunk = async () => {
    if (needsRef.current.length === 0) {
      setStatus('done')
      setProgress(100)
      const link = `http://localhost:8101/upload/${fileIdRef.current}` // 假设的合并链接
      setUploadLink(link)
      console.log('上传完成！文件链接：', link)
      return
    }

    const chunkId = needsRef.current[0]
    const chunkItem = chunksListRef.current.find((item) => item.id === chunkId)

    if (!chunkItem) return

    const formData = new FormData()
    formData.append('file', chunkItem.content)
    formData.append('chunkId', chunkId)
    formData.append('fileId', fileIdRef.current)

    try {
      const res = await axios.post('http://localhost:8101/api/upload/', formData)
      console.log(`分片 ${chunkId} 响应:`, res.data) // 新增：每个分片打印响应，便于调试
      needsRef.current = res.data.data || []

      const uploaded = totalChunksRef.current - needsRef.current.length
      setProgress(Math.ceil((uploaded / totalChunksRef.current) * 100))

      uploadChunk() // 递归继续
    } catch (err) {
      setStatus('error')
      console.error('分片上传失败:', err)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault() // 新增：防止任何潜在默认行为（如隐式提交）
    event.stopPropagation() // 新增：停止事件冒泡，防止上层干扰

    const file = event.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setProgress(0)
    setUploadLink(null) // 重置链接

    try {
      const fileInfo = await splitFileAndCalculateHash(file)

      const handshakeData = {
        fileId: fileInfo.fileId,
        ext: fileInfo.ext,
        chunkIds: fileInfo.chunks.map((c) => c.id)
      }

      const handshakeRes = await handshake(handshakeData)
      needsRef.current = handshakeRes.data || []

      uploadChunk()
    } catch (err) {
      setStatus('error')
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '40px' }}>
      <input type="file" onChange={handleFileChange} />
      {status === 'uploading' && <p>上传进度: {progress}%</p>}
      {status === 'done' && (
        <>
          <p>上传完成！</p>
          {uploadLink && <a href={uploadLink} target="_blank" rel="noopener noreferrer">查看文件</a>} {/* 新增：显示链接，避免 console */}
        </>
      )}
      {status === 'error' && <p>上传失败，请重试</p>}
    </div>
  )
}
