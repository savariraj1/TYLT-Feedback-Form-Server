const express = require("express");
const router = express.Router();
const db = require("../db");
const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "http://localhost:3000";

router.post("/", async (req, res) => {

    try {
        
        console.log(req.body);

        const {
            booking_id,
            customer_name,
            company_name,
            driver_name,
            vehicle_number,
            trip_date
        } = req.body;

        const feedback_id =
            "FB" + Date.now();

        await db.execute(

            `INSERT INTO feedback
            (
                feedback_id,
                booking_id,
                customer_name,
                company_name,
                driver_name,
                vehicle_number,
                trip_date,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                feedback_id,
                booking_id,
                customer_name,
                company_name,
                driver_name,
                vehicle_number,
                trip_date,
                "Pending"
            ]

        );

        const link = `${frontendBaseUrl}/?feedback=${feedback_id}`;

        res.json({

            success: true,

            feedback_id,

            link

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

module.exports = router;
