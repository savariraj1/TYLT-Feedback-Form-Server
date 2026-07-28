const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {

    try {

        const {
            search = "",
            from = "",
            to = "",
            rating = ""
        } = req.query;

        let where = " WHERE 1=1 ";
        let params = [];

        // Search
        if (search) {

            where += `
                AND (
                    company_name LIKE ?
                    OR customer_name LIKE ?
                    OR driver_name LIKE ?
                    OR booking_id LIKE ?
                )
            `;

            const value = `%${search}%`;

            params.push(value, value, value, value);

        }

        // From Date
        if (from) {

            where += " AND DATE(trip_date) >= ? ";
            params.push(from);

        }

        // To Date
        if (to) {

            where += " AND DATE(trip_date) <= ? ";
            params.push(to);

        }

        // Rating
        if (rating) {

            where += " AND overall_rating LIKE ? ";
            params.push(`${"⭐".repeat(Number(rating))}%`);

        }

        //------------------------------------
        // Monthly
        //------------------------------------

        const [monthly] = await db.execute(

            `
            SELECT
                MONTH(trip_date) AS month,
                COUNT(*) AS total
            FROM feedback
            ${where}
            GROUP BY MONTH(trip_date)
            ORDER BY MONTH(trip_date)
            `,
            params

        );

        //------------------------------------
        // Rating
        //------------------------------------

        const [ratings] = await db.execute(

            `
            SELECT
                overall_rating,
                COUNT(*) total
            FROM feedback
            ${where}
            GROUP BY overall_rating
            ORDER BY overall_rating
            `,
            params

        );

        //------------------------------------
        // Companies
        //------------------------------------

        const [companies] = await db.execute(

            `
            SELECT
                company_name,
                COUNT(*) total
            FROM feedback
            ${where}
            GROUP BY company_name
            ORDER BY total DESC
            `,
            params

        );

        //------------------------------------
        // Drivers
        //------------------------------------

        const [drivers] = await db.execute(

            `
            SELECT
                driver_name,
                ROUND(
                    AVG(
                        CASE

                            WHEN overall_rating LIKE '⭐⭐⭐⭐⭐%' THEN 5
                            WHEN overall_rating LIKE '⭐⭐⭐⭐%' THEN 4
                            WHEN overall_rating LIKE '⭐⭐⭐%' THEN 3
                            WHEN overall_rating LIKE '⭐⭐%' THEN 2
                            WHEN overall_rating LIKE '⭐%' THEN 1

                        END
                    ),
                    1
                ) rating
            FROM feedback
            ${where}
            GROUP BY driver_name
            ORDER BY rating DESC
            `,
            params

        );

        res.json({

            monthly,
            ratings,
            companies,
            drivers

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

});

module.exports = router;