const mysql = require("mysql2/promise");

const dbTarget = (process.env.DB_TARGET || "local").toLowerCase();
const useProductionUrl = dbTarget === "production" || dbTarget === "prod";
const isRunningInDocker = String(process.env.RUNNING_IN_DOCKER || "").toLowerCase() === "true";

const requestedLocalHost = process.env.DB_HOST || "localhost";
const resolvedLocalHost = isRunningInDocker && requestedLocalHost === "localhost"
    ? "host.docker.internal"
    : requestedLocalHost;

const localDbConfig = {
    host: resolvedLocalHost,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tylt_feedback",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    dateStrings: true
};

const poolConfig = useProductionUrl && process.env.DB_URL
    ? process.env.DB_URL
    : localDbConfig;

if (useProductionUrl && !process.env.DB_URL) {
    console.warn("⚠️ DB_TARGET is production but DB_URL is missing. Falling back to local DB settings.");
}

const pool = mysql.createPool(poolConfig);

(async () => {
    try {
        const conn = await pool.getConnection();
        const connectedTarget = useProductionUrl && process.env.DB_URL ? "production (DB_URL)" : "local";
        console.log(`✅ MySQL Connected (${connectedTarget})`);
        conn.release();
    } catch (err) {
        console.error("❌", err.message);
    }
})();

module.exports = pool;
