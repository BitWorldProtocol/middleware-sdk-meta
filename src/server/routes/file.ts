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
import { asc, desc, sql, eq, isNull, and } from "drizzle-orm";
import { filesCanOrderByColumns } from "../db/validate-schema";

const bucket = process.env.BUCKET!;
const apiEndpoint = process.env.API_END_POINT ? process.env.API_END_POINT : "";
const region = process.env.REGION ? process.env.REGION : "";
const COS_APP_ID = process.env.COS_APP_ID ? process.env.COS_APP_ID : "";
const COS_APP_SECRET = process.env.COS_APP_SECRET
  ? process.env.COS_APP_SECRET
  : "";

const filesOrderByColumnSchema = z.object({
  field: filesCanOrderByColumns.keyof(),
  order: z.enum(["desc", "asc"])
}).optional()

export type FilesOrderByColumn = z.infer<typeof filesOrderByColumnSchema>

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
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.string(),
          })
          .optional(),
        limit: z.number().default(10),
        orderBy: filesOrderByColumnSchema
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, orderBy = {field: 'createdAt', order: 'desc'} } = input;

      const deletedFileter = isNull(files.deletedAt)

      const statement = db
        .select()
        .from(files)
        .limit(limit)
        .where(
          cursor
            ? and(orderBy.field === 'createdAt' && orderBy.order ==='asc' 
              ? sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") > (${new Date(
                  cursor.createdAt
                ).toISOString()}, ${cursor.id})`
                : sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") < (${new Date(
                  cursor.createdAt
                ).toISOString()}, ${cursor.id})`, deletedFileter)
            : deletedFileter
        )
      // const result = await statement.execute();
        
      statement.orderBy(
        orderBy.order === 'desc' ? desc(files[orderBy.field]): asc(files[orderBy.field])
      )

      const result = await statement;

      return {
        items: result,
        nextCursor:
          result.length > 0
            ? {
                createdAt: result[result.length - 1].createdAt!,
                id: result[result.length - 1].id,
              }
            : null,
      };
    }),

  
  // 根据文件id删除file，其实是更新file的deleteAt时间  
  deleteFile: protectedProcedure.input(z.string()).mutation(async({ ctx, input}) => {
    return db.update(files).set({
      deletedAt: new Date()
    }).where(eq(files.id, input))
  })  
});
