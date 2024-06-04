"use client";
import { useEffect, useState } from "react";
import {
  UploadCallback,
  UploadSuccessCallback,
  Uppy,
  UppyFile,
} from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { useUppyState } from "./useUppyState";
import { trpcClient, trpcClientReact, trpcPureClient } from "@/utils/api";
import { UploadButton } from "@/components/feature/UploadButton";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Dropzone } from "@/components/feature/Dropzone";
import { cn } from "@/lib/utils";
import { usePasteFile } from "@/hooks/usePasteFile";
import { UploadPreview } from "@/components/feature/UploadPreview";

export default function Home() {
  const [uppy] = useState(() => {
    const uppy = new Uppy();
    // 使用插件
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      // 返回一个pre-url给客户端，让用户直接上传到aws s3
      getUploadParameters(file) {
        // console.log(file);
        return trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size,
        });
      },
    });
    return uppy;
  });

  const utils = trpcClientReact.useUtils();

  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();

  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  useEffect(() => {
    const handler: UploadSuccessCallback<{}> = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type,
        }).then((res) => {
          utils.file.listFiles.setData(void 0, (prev) => {
            if (!prev) {
              return prev
            }
            return [res, ...prev]
          })
        });
      }
    };

    const uploadProgressHandler: UploadCallback = (data) => {
      setUploadingFileIDs((currentFiles) => [...currentFiles, ...data.fileIDs]);
    };

    const completeHandler = () => {
      setUploadingFileIDs([]);
    };

    uppy.on("upload", uploadProgressHandler);

    uppy.on("upload-success", handler);

    uppy.on("complete", completeHandler);

    return () => {
      uppy.off("upload-success", handler);
      uppy.off("upload", uploadProgressHandler);
      uppy.off("complete", completeHandler);
    };
  }, [uppy]);

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(
        files.map((file) => ({
          data: file,
        }))
      );
    },
  });

  return (
    <div className="container mx-auto p-2">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => {
            uppy.upload();
          }}
        >
          Upload
        </Button>
        <UploadButton uppy={uppy}></UploadButton>
      </div>
      {isPending && <div>Loading...</div>}
      <Dropzone uppy={uppy}>
        {(draging) => {
          return (
            <div
              className={cn(
                "flex flex-wrap gap-4 relative",
                draging && "border border-dashed"
              )}
            >
              {draging && (
                <div className="absolute inset-0 bg-secondary/30 flex justify-center items-center text-3xl ">
                  Drop File Here to Upload
                </div>
              )}

              {uploadingFileIDs.length > 0 && uploadingFileIDs.map((id) => {
                
                  const file = uppyFiles[id];
                  const isImage = file.data.type.startsWith("image");

                  const url = URL.createObjectURL(file.data);
                  return (
                    <div
                      key={file.id}
                      className="w-56 h-56 flex justify-center items-center border border-red-500"
                    >
                      {isImage ? (
                        <img src={url} alt={file.name} />
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

              {fileList?.map((file) => {
                const isImage = file.contentType.startsWith("image");
                return (
                  <div
                    key={file.id}
                    className="w-56 h-56 flex justify-center items-center border"
                  >
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
      <UploadPreview uppy={uppy}></UploadPreview>
    </div>
  );
}
