"use client";
import { useEffect, useState } from "react";
import { UploadSuccessCallback, Uppy } from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { useUppyState } from "./useUppyState";
import { trpcClientReact, trpcPureClient } from "@/utils/api";
import { UploadButton } from "@/components/feature/UploadButton";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Dropzone } from "@/components/feature/Dropzone";
import { cn } from "@/lib/utils";
import { usePasteFile } from "@/hooks/usePasteFile";

export default function Home() {
  const [uppy] = useState(() => {
    const uppy = new Uppy();
    // 使用插件
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      // 返回一个pre url给客户端，让用户直接上传到aws s3
      getUploadParameters(file) {
        console.log(file);
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size,
        });
      },
    });
    return uppy;
  });

  const files = useUppyState(uppy, (s) => Object.values(s.files));
  // 上传进度
  const progress = useUppyState(uppy, (s) => s.totalProgress);

  useEffect(() => {
    const handler: UploadSuccessCallback<{}> = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type,
        });
      }
    };
    uppy.on("upload-success", handler);

    return () => {
      uppy.off("upload-success", handler);
    };
  }, [uppy]);

  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();
  
  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          data: file
        })),
      );
    },
  });  

  return (
    <div className="container mx-auto p-2">
      <div>
        <UploadButton uppy={uppy}></UploadButton>
        <Button
          onClick={() => {
            uppy.upload();
          }}
        >
          Upload
        </Button>
        {/* <div>{progress}</div> */}
      </div>
      {isPending && <div>Loading...</div>}
      <Dropzone uppy={uppy}>
        {(draging) => {
          return (
            <div className={cn("flex flex-wrap gap-4 relative", draging && "border border-dashed")}>
              {
                draging && (
                  <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center text-3xl ">
                    Drop File Here to Upload
                  </div>
                )
              }
              {fileList?.map((file) => {
                const isImage = file.contentType.startsWith("image");
                return (
                  <div
                    key={file.id}
                    className="w-56 h-56 flex justify-center items-center border"
                  >
                    {/* {file.name} */}
                    {isImage ? (
                      <img src={file.url} alt={file.name} />
                    ) : (
                      <Image
                        src="/unknown-file-types.png"
                        width={100}
                        height={100}
                        alt="unknow file type"
                      ></Image>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      </Dropzone>
      {files.map((file) => {
        const url = URL.createObjectURL(file.data);
        return <img src={url} key={file.id} alt={file.name}/>;
      })}
    </div>
  );
}
