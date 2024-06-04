import z from "zod";
import { router, protectedProcedure } from "../trpc";
import { v4 as uuid } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/server/db/db";
import { files } from "@/server/db/schema";
import { desc } from "drizzle-orm";
import { gt } from "drizzle-orm/expressions";

const bucket = "";
const apiEndpoint = "";
const region = "";
const COS_APP_ID = "";
const COS_APP_SECRET = "";

export const fileRoutes = router({
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // console.log("createPresignedUrl*****", input);
      const date = new Date();

      const isoString = date.toISOString();

      const dateString = isoString.split("T")[0];

      const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
        ContentLength: input.size,
      };
      const s3Client = new S3Client({
        endpoint: apiEndpoint,
        region: region,
        credentials: {
          accessKeyId: COS_APP_ID,
          secretAccessKey: COS_APP_SECRET,
        },
      });

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      return {
        url,
        method: "PUT" as const,
      };
    }),
  saveFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const url = new URL(input.path);

      const photo = await db
        .insert(files)
        .values({
          ...input,
          id: uuid(),
          path: url.pathname,
          url: url.toString(),
          userId: session.user.id,
          contentType: input.type,
        })
        // 返回插入的数据
        .returning();
      // console.log("文件上传:", photo[0])
      return photo[0];
    }),

  listFiles: protectedProcedure.query(async () => {
    const result = await db.query.files.findMany({
      orderBy: [desc(files.createdAt)],
    });

    return result;
  }),

  infinityQueryFiles: protectedProcedure
    .input(z.object({ 
        cursor: z.string().optional(),
        limit: z.number().default(10) 
    }))
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const result = await db
        .select()
        .from(files)
        .limit(limit)
        .where(cursor ? gt(files.id, cursor) : undefined)
        .orderBy(desc(files.createdAt));
      return {
        items: result,
        nextCursor: result[result.length - 1].id,
      };
    }),
});
