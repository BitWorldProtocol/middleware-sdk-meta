import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// for query purposes
const queryClient = postgres("postgres://postgres:123456@localhost:5432/postgres");
export const db = drizzle(queryClient);