import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import SparkMD5 from "spark-md5";
import axios from "axios";
import { rejects } from "assert";
export default () => {
  /**
   * 需要注意的是:
   * 1.info.file 是 Ant Design Upload 组件封装后的文件对象（包含 uid、name、status 等额外属性），并非浏览器原生的 File 对象，因此它没有 slice 方法。
   * 2.可以使用info.file.originFileObj，info.file.originFileObj的Prototype是File，但info.file的Prototype是Object
   */

  const submitUpload = async (file: File) => {
    return new Promise((resolve, reject) => {
      let chunks = [];
      const chunkSize = 2 * 1024 * 1024; //2MB
      let start = 0;
      let token = new Date().getTime().toString();
      const totalSize = file.size;
      if (totalSize > chunkSize) {
        while (start < totalSize) {
          // 优化：用 Math.min 确保结束位置不超过文件总大小，避免切割出空片段
          const end = Math.min(start + chunkSize, totalSize);
          let sliceFile = file.slice(start, end);
          chunks.push(sliceFile);
          start += chunkSize;
        }
      } else {
        chunks.push(file.slice(0));
      }
      resolve(chunks);
    });
    /** 
    let sendChunkCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      let fd = new FormData();
      fd.append("token", token);
      fd.append("f1", chunks[i]);
      fd.append("index", i.toString());
      axios.post("http://localhost:8101/", fd).then((res) => {
        sendChunkCount += 1;
        console.log("sendChunkCount", sendChunkCount);
        if (sendChunkCount == chunks.length) {
          console.log("上传完成，发送合并请求");
          let fd = new FormData();
          fd.append("type", "merge");
          fd.append("token", token);
          fd.append("chunkCount", totalSize.toString());
          fd.append("filename", file.name);
          axios.post("http://localhost:8100/", fd).then((res) => {});
        }
      });
    }
      */
  };

  //   const sendFile()=>{

  //   }

  const customUpload = async (options) => {
    let chunks = (await submitUpload(options.file)) as Blob[];
    let fileInfo = await splitFile(options.file, chunks);
    let handleShakeRes = handleShake(fileInfo);

    // submitUpload(options.file);
  };

  /**
   * 文件分片
   * @param file
   */
  let start = 0;
  const chunkSize = 2 * 1024 * 1024; //2MB
  let end = 0;
  let fileReader = null;
  const splitFile = async (file: File, chunks: Blob[]) => {
    console.log("file", file);
    console.log("chunksaaa", chunks);
    let chunkIndex = 0;
    return new Promise((resolve, reject) => {
      //使用ArrayBuffer完成文件MD5编码
      const spark = new SparkMD5.ArrayBuffer();
      fileReader = new FileReader(); //文件读取器
      fileReader.onload = (e) => {
        start = end;
        console.log("e", e);
        let chunksId = SparkMD5.ArrayBuffer.hash(e.target.result) + chunkIndex;
        console.log("chunksId", chunksId);
        chunkIndex++;
        spark.append(e.target.result);
        // new Blob([e.target.result]
        if (chunkIndex < chunks.length) {
          loadNext(file);
        } else {
          const fileId = spark.end();
          console.log("fileId", fileId);
          resolve({
            fileId,
            ext: file.name.split(".").slice(-1)[0],
            chunks,
          });
        }
      };
      loadNext(file);
      //   for (let i = 0; i < chunks.length; i++) {
      //     spark.append("")
      //   }
    });
  };
  /**
   * 读取下一个分片
   */
  const loadNext = (file: File) => {
    end = start + chunkSize;
    fileReader.readAsArrayBuffer(file.slice(start, end));
  };

  /**
   * 传递SparkMd5加密数组
   */
  const handleShake = (fileInfo) => {
    axios.post("http://localhost:8101/api/upload/handshake", fileInfo);
  };

  return (
    <div>
      {/* <Upload {...props}> */}
      <Upload customRequest={customUpload} showUploadList={true}>
        <Button icon={<UploadOutlined />}>上传</Button>
      </Upload>
    </div>
  );
};
