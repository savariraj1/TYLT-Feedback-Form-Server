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

async function ensureFeedbackTable() {
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS feedback (
            id INT NOT NULL AUTO_INCREMENT,
            feedback_id VARCHAR(64) NOT NULL,
            booking_id VARCHAR(64) NOT NULL,
            customer_name VARCHAR(255) DEFAULT NULL,
            company_name VARCHAR(255) DEFAULT NULL,
            driver_name VARCHAR(255) DEFAULT NULL,
            vehicle_number VARCHAR(64) DEFAULT NULL,
            trip_date DATE DEFAULT NULL,
            overall_rating VARCHAR(50) DEFAULT NULL,
            driver_rating VARCHAR(50) DEFAULT NULL,
            cleanliness_rating VARCHAR(50) DEFAULT NULL,
            punctuality_rating VARCHAR(50) DEFAULT NULL,
            recommendation VARCHAR(20) DEFAULT NULL,
            comments TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_feedback_feedback_id (feedback_id),
            UNIQUE KEY uq_feedback_booking_id (booking_id),
            KEY idx_feedback_status (status),
            KEY idx_feedback_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.execute(createTableSql);
}

(async () => {
    try {
        const conn = await pool.getConnection();
        const connectedTarget = useProductionUrl && process.env.DB_URL ? "production (DB_URL)" : "local";
        console.log(`✅ MySQL Connected (${connectedTarget})`);
        conn.release();

        await ensureFeedbackTable();
        console.log("✅ Ensured table exists: feedback");
    } catch (err) {
        console.error("❌", err.message);
    }
})();

module.exports = pool;
