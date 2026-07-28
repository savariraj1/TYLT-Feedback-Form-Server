const express = require("express");
const router = express.Router();
const db = require("../db");

function buildAverageRatingExpression() {
    return `ROUND(
        AVG(
            CASE
                WHEN overall_rating REGEXP '^[0-9]+(\\.[0-9]+)?$' THEN CAST(overall_rating AS DECIMAL(10,2))
                WHEN overall_rating LIKE '⭐⭐⭐⭐⭐%' THEN 5
                WHEN overall_rating LIKE '⭐⭐⭐⭐%' THEN 4
                WHEN overall_rating LIKE '⭐⭐⭐%' THEN 3
                WHEN overall_rating LIKE '⭐⭐%' THEN 2
                WHEN overall_rating LIKE '⭐%' THEN 1
                ELSE NULL
            END
        ),
        1
    ) AS averageRating`;
}

router.get("/", async (req, res) => {
    try {
        const [columns] = await db.execute("SHOW COLUMNS FROM feedback");
        const columnNames = new Set(columns.map((column) => column.Field));

        const dateColumn = columnNames.has("created_at")
            ? "created_at"
            : columnNames.has("trip_date")
                ? "trip_date"
                : null;

        const orderColumn = columnNames.has("id")
            ? "id"
            : columnNames.has("created_at")
                ? "created_at"
                : columnNames.has("trip_date")
                    ? "trip_date"
                    : columnNames.has("feedback_id")
                        ? "feedback_id"
                        : null;

        const [[total]] = await db.execute(
            "SELECT COUNT(*) AS totalFeedback FROM feedback"
        );

        let todayFeedback = 0;
        if (dateColumn) {
            const [[today]] = await db.execute(
                `SELECT COUNT(*) AS todayFeedback
                 FROM feedback
                 WHERE DATE(${dateColumn}) = CURDATE()`
            );
            todayFeedback = today.todayFeedback || 0;
        }

        let averageRating = 0;
        if (columnNames.has("overall_rating")) {
            const [[avg]] = await db.execute(
                `SELECT ${buildAverageRatingExpression()}
                 FROM feedback`
            );
            averageRating = avg.averageRating || 0;
        }

        let recommendation = 0;
        if (columnNames.has("recommendation")) {
            const [[recommend]] = await db.execute(
                `SELECT ROUND(
                    SUM(CASE WHEN LOWER(recommendation) = 'yes' THEN 1 ELSE 0 END) * 100 / NULLIF(COUNT(*), 0),
                    1
                ) AS recommendation
                 FROM feedback`
            );
            recommendation = recommend.recommendation || 0;
        }

        let recent = [];
        if (orderColumn) {
            [recent] = await db.execute(
                `SELECT *
                 FROM feedback
                 ORDER BY ${orderColumn} DESC
                 LIMIT 10`
            );
        }

        res.json({
            totalFeedback: total.totalFeedback || 0,
            todayFeedback,
            averageRating,
            recommendation,
            recent
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
