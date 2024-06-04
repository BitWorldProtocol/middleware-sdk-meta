import Uppy from "@uppy/core";
import { HTMLAttributes, ReactNode, useRef, useState } from "react";

export function Dropzone({
  uppy,
  children,
  ...divProps
}: {
  uppy: Uppy;
  children: ReactNode | ((draging: boolean) => ReactNode);
} & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  const [draging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (
    <div
      {...divProps}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if(timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        timerRef.current = setTimeout(() => {
            setDragging(false)
        }, 50)
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if(timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
      }}
      onDrag={(e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
          uppy.addFile({
            data: file,
          });
        });
        setDragging(false);
      }}
    >
      {typeof children == "function" ? children(draging): children }
    </div>
  );
}
