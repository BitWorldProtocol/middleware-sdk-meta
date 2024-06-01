"use client"
import { useEffect, useState } from "react"
import { UploadSuccessCallback, Uppy } from "@uppy/core"
import AWSS3 from "@uppy/aws-s3"
import { useUppyState } from "./useUppyState"
import { trpcPureClient } from "@/utils/api"
import { Button } from "@/components/Button"

export default function Home() {

  const [uppy] = useState(() => {
    const uppy = new Uppy()
    // 使用插件
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      // 返回一个pre url给客户端，让用户直接上传到aws s3
      getUploadParameters(file) {
        console.log(file);
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size
        })
      }
    })
    return uppy
  })

  useEffect(() => {
    const handler: UploadSuccessCallback<{}> = (file, resp) => {
      if(file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name: "test",
          path: resp.uploadURL ?? "",
          type: file.data.type
        })
      }
    }
    uppy.on("upload-success", handler)

    return () => {
      uppy.off("upload-success", handler)
    }
  }, [uppy])

  const files = useUppyState(uppy, (s) => Object.values(s.files))
  // 上传进度
  const progress = useUppyState(uppy, (s) => s.totalProgress)

  return (
    <div className="h-screen flex justify-center items-center">
        {/* 将多个文件添加到uppy中 */}
        <input type="file" onChange={(e) => {
            if(e.target.files) {
              Array.from(e.target.files).forEach((file) => {
                uppy.addFile({
                  data: file,
                })
              })
            }
        }} /> multiple
        {
          files.map((file) => {
            const url = URL.createObjectURL(file.data)
            return <img src={url} key={file.id}></img>;
          })
        }
        <Button 
          onClick={() => {
            uppy.upload()
          }}>
            Upload
        </Button>
        <div>{progress}</div>
    </div>
  )
}
