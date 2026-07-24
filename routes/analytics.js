const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {

    try {

        // Monthly feedback
        const [monthly] = await db.execute(`
            SELECT
                MONTH(created_at) AS month,
                COUNT(*) AS total
            FROM feedback
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
        `);

        // Rating distribution
        const [ratings] = await db.execute(`
            SELECT
                overall_rating,
                COUNT(*) AS total
            FROM feedback
            GROUP BY overall_rating
            ORDER BY overall_rating
        `);

        // Company-wise
        const [companies] = await db.execute(`
            SELECT
                company_name,
                COUNT(*) AS total
            FROM feedback
            GROUP BY company_name
            ORDER BY total DESC
            LIMIT 10
        `);

        // Driver-wise
        const [drivers] = await db.execute(`
            SELECT
                driver_name,
                ROUND(AVG(overall_rating),1) AS rating
            FROM feedback
            GROUP BY driver_name
            ORDER BY rating DESC
            LIMIT 10
        `);

        res.json({
            monthly,
            ratings,
            companies,
            drivers
        });

    } catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

module.exports = router;