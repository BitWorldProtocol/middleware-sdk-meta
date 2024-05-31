"use client"

import { useState } from "react"
import { Uppy } from "@uppy/core"
import AWSS3 from "@uppy/aws-s3"

export default function Home() {

  const [uppy] = useState(() => {
    const uppy = new Uppy()
    // 使用插件
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      // 返回一个pre url给客户端，让用户直接上传到aws s3
      getUploadParameters() {
        return {
          url: '',
        }
      }
    })
    return uppy 
  })


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
        }} > multiple </input>
    </div>
  )
}
