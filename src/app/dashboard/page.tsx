"use client";
import { useState } from "react";
import {
  Uppy,
} from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { trpcPureClient } from "@/utils/api";
import { UploadButton } from "@/components/feature/UploadButton";
import { Button } from "@/components/ui/Button";
import { Dropzone } from "@/components/feature/Dropzone";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";
import { FileList } from "@/components/feature/FileList";
import { FilesOrderByColumn } from "@/server/routes/file";
import { MoveUp, MoveDown } from "lucide-react";

export default function Home() {
  // 初始化uppy
  const [uppy] = useState(() => {
    const uppy = new Uppy();
    // 使用插件
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      // 返回一个pre-url给客户端，让用户直接上传到aws s3
      getUploadParameters(file) {
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size,
        });
      },
    });
    return uppy;
  })

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          data: file,
        }))
      );
    },
  });

  const [orderBy, setOrderBy] = useState<Exclude<FilesOrderByColumn, undefined>>({
    field: 'createdAt',
    order: "desc"
  })

  return (
    <div className="mx-auto h-full">
      <div className="container flex justify-between items-center h-[60px]">
        <Button onClick={() => {
          setOrderBy(current => ({
            ...current,
            order: current?.order === "asc" ? "desc" : "asc"
          }))
        }}>
          Created At{" "}
          {orderBy.order === 'desc' ? <MoveUp /> : <MoveDown />}
        </Button>
        <UploadButton uppy={uppy}></UploadButton>
      </div>
      
      <Dropzone uppy={uppy} className="relative h-[calc(100%-60px)]">
        {
          (draging) => {
            return <>
              {
                draging && (
                  <div className="absolute inset-0 bg-secondary/50 z-10 flex justify-center items-center text-3xl ">
                    Drop File Here to Upload
                  </div>
                )
              }
              <FileList uppy={uppy} orderBy={orderBy}></FileList>
            </>}
        }
      </Dropzone>
      <UploadPreview uppy={uppy}></UploadPreview>
    </div>
  );
}
