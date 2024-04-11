import pkg from "pg";
const { Pool } = pkg;
export const db = new Pool({
    host: "postgres",
    port: 5432,
    user: "John",
    password: "1234",
    database: "relationshipTesting"
});
