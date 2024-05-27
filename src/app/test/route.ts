import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const inputSchema = z.object({
  name: z.string().min(3).max(10),
  email: z.string().email()
});

/**
 * 处理GET请求，验证查询参数，并返回验证结果。
 * 
 * @param request - Next.js的请求对象，包含URL查询参数。
 * @returns 返回一个NextResponse对象，包含验证成功后的数据或错误信息。
 */
export function GET(request: NextRequest) {
    // 提取查询参数
    const query = request.nextUrl.searchParams

    const name = query.get("name")
    const email = query.get("email")

    // 使用输入模式解析查询参数
    const result = inputSchema.safeParse({
        name,
        email
    })

    // 根据解析结果返回相应的JSON响应
    if(result.success) {
        return NextResponse.json(result.data)
    } else {
        return NextResponse.json({
            error: result.error.message
        })
    }

    // 注释掉的代码块，原计划可能是返回完整的解析结果，但当前逻辑已更改。
}