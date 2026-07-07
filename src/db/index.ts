import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.ts';

// Neon serverless HTTP driver: each query is a single stateless HTTP call,
// so it never hangs waiting on a TCP pool connection to a suspended compute.
const SQL_HOST = process.env.SQL_HOST;
const SQL_USER = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
const SQL_PASSWORD = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
const SQL_DB_NAME = process.env.SQL_DB_NAME;

const connectionString = "postgresql://" + SQL_USER + ":" + SQL_PASSWORD + "@" + SQL_HOST + "/" + SQL_DB_NAME + "?sslmode=require";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
