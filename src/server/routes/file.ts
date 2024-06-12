import z, { number } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { files } from "../db/schema";
import { db } from "../db/db";
import { v4 as uuid } from "uuid";
import { asc, desc, gt, lt, sql } from "drizzle-orm";
import { filesCanOrderByColumns } from "../db/validate-schema";

const bucket = "test-image-1300216527";
const apiEndpoint = "https://cos.ap-nanjing.myqcloud.com";
const region = "ap-nanjing";
const COS_APP_ID = "AKIDBLXrx051CNXktvy6KYio6LdzGnIh4fJs";
const COS_APP_SECRET = "yrqsqvux45zmT9zqaIvSvKqGapyxpaXR";

const filesOrderByColumnSchema = z
    .object({
        field: filesCanOrderByColumns.keyof(),
        order: z.enum(["desc", "asc"]),
    })
    .optional();

export type FilesOrderByColumn = z.infer<typeof filesOrderByColumnSchema>;

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
                .returning();

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
                orderBy: filesOrderByColumnSchema,
            })
        )
        .query(async ({ input }) => {
            const {
                cursor,
                limit,
                orderBy = { field: "createdAt", order: "desc" },
            } = input;

            const statement = db
                .select()
                .from(files)
                .limit(limit)
                .where(
                    cursor
                        ? sql`("files"."created_at", "files"."id") < (${new Date(
                              cursor.createdAt
                          ).toISOString()}, ${cursor.id})`
                        : undefined
                );
            // .orderBy(desc(files.createdAt));

            statement.orderBy(
                orderBy.order === "desc"
                    ? desc(files[orderBy.field])
                    : asc(files[orderBy.field])
            );

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
});