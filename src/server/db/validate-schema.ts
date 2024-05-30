import { createInsertSchema } from "drizzle-zod";
import { users } from "./schema";

export const createUserSchema = createInsertSchema(users, {
    email: (schema) => schema.email.email()
});

/**
 * 表示在更新用户时，允许更新email字段
 */
export const updateUserSchema = createUserSchema.pick({
    email: true
});