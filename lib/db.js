import { neon } from '@neondatabase/serverless';

// The Neon serverless driver talks to the DB over HTTP, so there's no
// connection pool to manage or exhaust across serverless invocations —
// no `global._db` singleton dance needed like the old ioredis client.
const sql = neon(process.env.DATABASE_URL);

export default sql;