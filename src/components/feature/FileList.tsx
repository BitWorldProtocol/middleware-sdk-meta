import { trpcClientReact, trpcPureClient } from "@/utils/api";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UploadCallback, UploadSuccessCallback, Uppy } from "@uppy/core";
import { useState, useEffect } from "react";
import { useUppyState } from "@/app/dashboard/useUppyState";
import { LocalFileItem, RemoteFileItem } from "./FileItem";

export function FileList({ uppy }: { uppy: Uppy }) {
  const { data: fileList, isPending } =
    trpcClientReact.file.listFiles.useQuery();
  
  const utils = trpcClientReact.useUtils();

  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  useEffect(() => {
    const handler: UploadSuccessCallback<{}> = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile
          .mutate({
            name: file.data instanceof File ? file.data.name : "test",
            path: resp.uploadURL ?? "",
            type: file.data.type,
          })
          .then((res) => {
            utils.file.listFiles.setData(void 0, (prev) => {
              if (!prev) {
                return prev;
              }
              return [res, ...prev];
            });
          });
      }
    };

    const uploadProgressHandler: UploadCallback = (data) => {
      setUploadingFileIDs((currentFiles) => [...currentFiles, ...data.fileIDs]);
    };

    const completeHandler = () => {
      setUploadingFileIDs([]);
    };

    // Fired when the upload starts
    uppy.on("upload", uploadProgressHandler);
    // Fired each time a single upload is completed
    uppy.on("upload-success", handler);
    // Fired when all uploads are complete
    // The result parameter is an object with arrays of successful and failed files
    uppy.on("complete", completeHandler);

    return () => {
      uppy.off("upload-success", handler);
      uppy.off("upload", uploadProgressHandler);
      uppy.off("complete", completeHandler);
    };
  }, [uppy, utils]);

  return (
    <>
      {isPending && <div>Loading...</div>}
      <div className={cn("flex flex-wrap gap-4 relative")}>
        {uploadingFileIDs.length > 0 &&
          uploadingFileIDs.map((id) => {
            const file = uppyFiles[id];
            return (
              <div
                key={file.id}
                className="w-56 h-56 flex justify-center items-center border border-red-500"
              >
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })}

        {fileList?.map((file) => {
          return (
            <div
              key={file.id}
              className="w-56 h-56 flex justify-center items-center border"
            >
                <RemoteFileItem contentType={file.contentType} url={file.url} name={file.name}></RemoteFileItem>
            </div>
          );
        })}
      </div>
    </>
  );
}
