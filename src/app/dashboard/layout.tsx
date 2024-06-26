import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession()
  if(!session?.user) {
    redirect('/api/auth/signin')
  }
  return (
    <div className="h-screen">
      <nav className="h-[80px] flex justify-end items-center border-b relative">
        <Button variant="ghost">
          <Avatar>
            <AvatarImage src={session.user.image!}></AvatarImage>
            <AvatarFallback>{session.user.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </Button>
        <div className="absolute h-full left-1/2 -translate-x-1/2 flex justify-center items-center">
          页面导航
        </div>
      </nav>
      <main className="h-[calc(100%-80px)]">{children}</main>
    </div>
  );
}
