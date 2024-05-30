import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { trpcClientReact } from "@/utils/api";
import { SessionProvider, UserInfo } from "./UserInfo";
import { getServerSession } from "@/server/auth";

export default async function Home() {

  // const {data, isLoading} = trpcClientReact.hello.useQuery()
  const session = await getServerSession()

  console.log(session, "------> only server can see")
 
  return (
    <div className="h-screen flex justify-center items-center">
      <form className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Create App</h1>
        <Input name="name" placeholder="App Name"></Input>
        <Textarea name="description" placeholder="Description"></Textarea>
        <Button type="submit">Submit</Button>
        <SessionProvider>
          <UserInfo />
        </SessionProvider>
        {/* {data?.hello}
        {isLoading && <p>Loading...</p>} */}
      </form>
    </div>
  )
}
