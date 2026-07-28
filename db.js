require("dotenv").config();
const mysql = require("mysql2/promise");

const dbTarget = (process.env.DB_TARGET || "local").toLowerCase();
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 10);

const poolConfig = (() => {
    if (dbTarget === "production" && process.env.DB_URL) {
        const url = new URL(process.env.DB_URL);

        return {
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, "")
        };
    }

    return {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "tylt_feedback"
    };
})();

const pool = mysql.createPool({
    ...poolConfig,
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    dateStrings: true
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log(`MySQL Connected (${dbTarget})`);
        conn.release();
    } catch (err) {
        console.error("MySQL connection failed:", err.message);
    }
})();

module.exports = pool;
