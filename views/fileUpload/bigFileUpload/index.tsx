import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import axios from "axios";
export default () => {
  /**
   * 需要注意的是:
   * 1.info.file 是 Ant Design Upload 组件封装后的文件对象（包含 uid、name、status 等额外属性），并非浏览器原生的 File 对象，因此它没有 slice 方法。
   * 2.可以使用info.file.originFileObj，info.file.originFileObj的Prototype是File，但info.file的Prototype是Object
   */
  const props: UploadProps = {
    name: "file",
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        // console.log("info", info);
        console.log("原生的", info.file.originFileObj);
        console.log(info.file, info.fileList);
        submitUpload(info.file.originFileObj);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const submitUpload = (file: File) => {
    const chunkSize = 2 * 1024 * 1024; //2MB
    // const chunkLength = Math.ceil(file.size / chunkSize);
    // console.log("大小", chunkLength);
    let chunks = [];
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
      //slice() 是 File/Blob 对象的方法，用于切割文件
      //file.slice(0)等价于 file.slice(0, file.size)  // 从0切割到文件末尾
      chunks.push(file.slice(0));
    }

    console.log("chunks.length", chunks.length);

    let sendChunkCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      let fd = new FormData();
      fd.append("token", token);
      fd.append("f1", chunks[i]);
      fd.append("index", i.toString());
      axios.post("http://localhost:8100/", fd).then((res) => {
        sendChunkCount += 1;
        console.log("sendChunkCount", sendChunkCount);
        if (sendChunkCount == chunks.length) {
          console.log("上传完成，发送合并请求");
          let fd = new FormData();
          fd.append("type", "merge");
          fd.append("token", token);
          fd.append("chunkCount", chunks.length.toString());
          fd.append("filename", file.name);
          axios.post("http://localhost:8100/", fd).then((res) => {});
        }
      });
    }
  };

  //   const sendFile()=>{

  //   }

  const customUpload = (options, info) => {
    // console.log("options", options);
    submitUpload(options.file);
    // console.log("info", info);
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
