import { trpcClientReact, trpcPureClient, AppRouter } from "@/utils/api";
import { cn } from "@/lib/utils";
import { UploadCallback, UploadSuccessCallback, Uppy } from "@uppy/core";
import { useState, useEffect, useRef } from "react";
import { useUppyState } from "@/app/dashboard/useUppyState";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";
import type { FilesOrderByColumn } from "@/server/routes/file"

type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

export function FileList({ uppy, orderBy }: { uppy: Uppy, orderBy: FilesOrderByColumn }) {
  //   const { data: fileList, isPending } =
  //     trpcClientReact.file.listFiles.useQuery();

  const {
    data: infinityQueryData,
    isPending,
    fetchNextPage,
  } = trpcClientReact.file.infinityQueryFiles.useInfiniteQuery(
    {
      limit: 6,
      orderBy
    },
    {
      getNextPageParam: (res) => res.nextCursor,
    }
  );

  const filesList = infinityQueryData
    ? infinityQueryData.pages.reduce((result, page) => {
        return [...result, ...page.items];
      }, [] as FileResult)
    : [];

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
            utils.file.infinityQueryFiles.setInfiniteData(
                { limit: 10},
                (prev) => {
                    if(!prev) return prev
                    return {
                        ...prev,
                        pages: prev.pages.map((page, index) => {
                            if(index === 0) {
                                return {
                                    ...page,
                                    items: [res, ...page.items]
                                }
                            }
                            return page
                        })
                    }
                }
            )
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

  // ---------------------------------> intersection
  // target element
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // console.log("bottomRef", bottomRef);
  useEffect(() => {
    if (bottomRef.current) {
      const observer = new IntersectionObserver(
        (e) => {
            console.log("------------>", e);
            if(e[0].intersectionRatio > 0.1) fetchNextPage();
        },
        { 
            threshold: 0.1 
        }
      );

      observer.observe(bottomRef.current);
      const element = bottomRef.current!;
      return () => {
        observer.unobserve(element);
        observer.disconnect();
      }
    }
  }, [fetchNextPage]);

  return (
    <ScrollArea className="h-full">
      {isPending && <div>Loading...</div>}
      <div
        className={cn("flex flex-wrap justify-center gap-4 relative container")}
      >
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

        {filesList?.map((file) => {
          return (
            <div
              key={file.id}
              className="w-56 h-80 flex justify-center items-center border"
            >
              <RemoteFileItem
                contentType={file.contentType}
                url={file.url}
                name={file.name}
              ></RemoteFileItem>
            </div>
          );
        })}
      </div>
      <div className={cn("flex justify-center p-8 border border-rose-600", filesList.length > 0 && "flex")} ref={bottomRef}>
        <Button variant="ghost" onClick={() => fetchNextPage()}>
          Load Next Page
        </Button>
      </div>
    </ScrollArea>
  );
}
