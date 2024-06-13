import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/db";
import sharp from "sharp"

const bucket = process.env.BUCKET!;
const apiEndpoint = process.env.API_END_POINT ? process.env.API_END_POINT : "";
const region = process.env.REGION ? process.env.REGION : "";
const COS_APP_ID = process.env.COS_APP_ID ? process.env.COS_APP_ID : "";
const COS_APP_SECRET = process.env.COS_APP_SECRET
  ? process.env.COS_APP_SECRET
  : "";
export async function GET(request: NextRequest, {params: { id }}: {params: {id: string}}) {

    const file = await db.query.files.findFirst({
        where: (files, { eq }) => eq(files.id, id)
    })

    if(!file || !file.contentType.startsWith("image")) {
        return new NextResponse("", {
            status: 400,
        })
    }

    const params: GetObjectCommandInput = {
        Bucket: bucket,
        Key: file.path
    }
    const s3Client = new S3Client({
        endpoint: apiEndpoint,
        region: region,
        credentials: {
          accessKeyId: COS_APP_ID,
          secretAccessKey: COS_APP_SECRET,
        },
    });

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // -------------------> sharp
    const byteArray = await response.Body?.transformToByteArray();
    if(!byteArray) {
        return new NextResponse("", {
            status: 400
        })
    }

    const image = sharp(byteArray);
    image.resize({
        width: 250,
        height: 250,
    })

    const buffer = await image.webp().toBuffer()

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=31536000, immutable"
        }
    })
    
}