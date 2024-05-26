// import '@/drizzle/envConfig';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "123456",
    database: "postgres",
  },
  verbose: true,
  strict: true,
});
