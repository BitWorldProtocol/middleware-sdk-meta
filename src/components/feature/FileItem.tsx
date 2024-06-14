import Image from "next/image";
import { useMemo } from "react";

export function FileItem({
  url,
  name,
  isImage,
}: {
  url: string;
  name: string;
  isImage: boolean;
}) {
  return isImage ? (
    <img src={url} alt={name} />
  ) : (
    <Image
      src="/unknown-file-types.png"
      width={100}
      height={100}
      alt="unknow file type"
    ></Image>
  );
}

export function LocalFileItem({ file }: { file: File }) {
  const isImage = file.type.startsWith("image");
  const url = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return "";
  }, [isImage, file]);

  return <FileItem url={url} isImage={isImage} name={file.name}></FileItem>;
}

export function RemoteFileItem({
  contentType,
  name,
  id,
}: {
  contentType: string;
  name: string;
  id: string;
}) {
  const isImage = contentType.startsWith("image");
  return (
    <FileItem url={`/image/${id}`} isImage={isImage} name={name}></FileItem>
  );
}
