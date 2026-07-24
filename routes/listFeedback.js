const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {

        const [[total]] = await db.query(
            "SELECT COUNT(*) AS totalFeedback FROM feedback"
        );

        const [[today]] = await db.query(
            "SELECT COUNT(*) AS todayFeedback FROM feedback WHERE DATE(created_at)=CURDATE()"
        );

        const [[rating]] = await db.query(
            "SELECT ROUND(AVG(overall_rating),1) AS averageRating FROM feedback"
        );

        const [[recommend]] = await db.query(
            "SELECT ROUND((SUM(recommendation='Yes')/COUNT(*))*100,1) AS recommendation FROM feedback"
        );

        res.json({
            totalFeedback: total.totalFeedback,
            todayFeedback: today.todayFeedback,
            averageRating: rating.averageRating || 0,
            recommendation: recommend.recommendation || 0
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;