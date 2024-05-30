import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
    console.log("----->");
    return NextResponse.json({
        a: "Hello World",
    });
}