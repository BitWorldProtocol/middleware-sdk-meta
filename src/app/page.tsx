import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await getServerSession()
  if (!session?.user) {
    redirect("/api/auth/signin")
  }
  
  return (
    <div className="h-screen flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name"></Input>
        <Textarea name="description" placeholder="Description"></Textarea>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}
