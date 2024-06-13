import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/Button";
import { Trash2 } from "lucide-react";

export function DeleteFile({fileId, onDeleteSuccess}: {fileId: string; onDeleteSuccess: (fileId: string) => void}) {
    const {mutate: deleteFile, isPending} = trpcClientReact.file.deleteFile.useMutation({
        onSuccess() {
            onDeleteSuccess(fileId)
        }
    })

    const handleRemoveFile = () => {
        deleteFile(fileId)
    }
    return (
        <Button variant="ghost" onClick={handleRemoveFile} disabled={isPending}>
            <Trash2 />
        </Button>
    )
}