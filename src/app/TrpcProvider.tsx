"use client";
import { ReactNode, useState } from "react"
import { trpcClient, trpcClientReact } from "@/utils/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export function TRPCProvider({ children }: {children: ReactNode}) {

    const [queryClient] = useState(() => new QueryClient())
    return (
        <trpcClientReact.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                { children}
            </QueryClientProvider>
        </trpcClientReact.Provider>
    )
}