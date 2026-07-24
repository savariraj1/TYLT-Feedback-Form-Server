const express = require("express");
const router = express.Router();
const db = require("../db");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

    router.post("/", async (req, res) => {

    console.log("Request received");

    console.log(req.body);

    try {

        const {
            booking_id,
            customer_name,
            company_name,
            driver_name,
            vehicle_number,
            trip_date,
            overall_rating,
            driver_rating,
            cleanliness_rating,
            punctuality_rating,
            recommendation,
            comments
        } = req.body;
        

        // Check if feedback has already been submitted
const [[exists]] = await db.execute(
    "SELECT status FROM feedback WHERE booking_id = ?",
    [booking_id]
);

if (!exists) {
    return res.status(404).json({
        success: false,
        message: "Booking not found."
    });
}

if (exists.status === "Completed") {
    return res.json({
        success: false,
        message: "Feedback has already been submitted."
    });
}

        const sql = `
            UPDATE feedback
            SET
            overall_rating=?,
            driver_rating=?,
            cleanliness_rating=?,
            punctuality_rating=?,
            recommendation=?,
            comments=?,
            status='Completed'
            WHERE booking_id=?
        `;
        const values = [
            overall_rating,
            driver_rating,
            cleanliness_rating,
            punctuality_rating,
            recommendation,
            comments,
            booking_id
        ];
        console.log(values);
        await db.execute(sql, values);

        res.json({
            success: true,
            message: "Feedback saved successfully."
        });

    } catch (err) {

    console.error("========== ERROR ==========");
    console.error(err);
    console.error("===================================");

    res.status(500).json({
        success: false,
        message: err.message
    });

}

});

// =========================================
// Check Feedback Status
// =========================================
router.get("/check/:feedbackId", async (req, res) => {
    try {

        const [rows] = await db.execute(
            "SELECT status FROM feedback WHERE feedback_id = ?",
            [req.params.feedbackId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        res.json({
            success: true,
            status: rows[0].status
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});
// Get all feedback
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM feedback ORDER BY id DESC"
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Get one feedback

router.get("/:feedbackId", async (req, res) => {

    try {

        const [rows] = await db.execute(
            "SELECT * FROM feedback WHERE feedback_id = ?",
            [req.params.feedbackId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// Update feedback
router.put("/:id", async (req, res) => {

    try {

        const {

            overall_rating,
            driver_rating,
            cleanliness_rating,
            punctuality_rating,
            recommendation,
            comments

        } = req.body;

        await db.execute(

                `UPDATE feedback
                SET overall_rating=?,
                    driver_rating=?,
                    cleanliness_rating=?,
                    punctuality_rating=?,
                    recommendation=?,
                    comments=?
                WHERE id=?`,

            [

                overall_rating,
                driver_rating,
                cleanliness_rating,
                punctuality_rating,
                recommendation,
                comments,
                req.params.id

            ]

        );

        res.json({

            success:true

        });

    } catch(err){

        res.status(500).json({

            success:false,
            message:err.message

        });

    }

});

// Delete feedback
router.delete("/:id", async(req,res)=>{

    try{

        await db.execute(

            "DELETE FROM feedback WHERE id=?",

            [req.params.id]

        );

        res.json({

            success:true

        });

    }

    catch(err){

        res.status(500).json({

            success:false,
            message:err.message

        });

    }

});
// =========================================
// Download Individual Feedback PDF
// =========================================
router.get("/:feedbackId/pdf", async (req, res) => {

    try {

        const [rows] = await db.execute(
            "SELECT * FROM feedback WHERE feedback_id=?",
            [req.params.feedbackId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Feedback not found");
        }

        const data = rows[0];

        const doc = new PDFDocument({
            margin: 40
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=TYLT_Feedback_${data.booking_id}.pdf`
        );

        doc.pipe(res);

        // ================= Header =================
        doc
            .fontSize(24)
            .fillColor("#0d6efd")
            .text("TYLT MOBILITY", {
                align: "center"
            });

        doc.moveDown();

        doc
            .fontSize(18)
            .fillColor("black")
            .text("Customer Feedback Report", {
                align: "center"
            });

        doc.moveDown(2);

        function row(label, value) {

            doc
                .font("Helvetica-Bold")
                .text(label + " :", {
                    continued: true,
                    width: 180
                });

            doc
                .font("Helvetica")
                .text(" " + (value || "-"));

            doc.moveDown(0.6);

        }

        row("Booking ID", data.booking_id);
        row("Customer", data.customer_name);
        row("Company", data.company_name);
        row("Driver", data.driver_name);
        row("Vehicle", data.vehicle_number);
        row("Trip Date", data.trip_date);

        doc.moveDown();

        function formatRating(rating) {

            if (!rating) return "-";

            const stars = (rating.match(/⭐/g) || []).length;

            const text = rating.replace(/⭐/g, "").trim();

            return `${"★".repeat(stars)} (${stars}/5) ${text}`;

        }

        row("Overall Rating", formatRating(data.overall_rating));
        row("Driver Rating", formatRating(data.driver_rating));
        row("Cleanliness", formatRating(data.cleanliness_rating));
        row("Punctuality", formatRating(data.punctuality_rating));

        doc.moveDown();

        doc
            .font("Helvetica-Bold")
            .text("Comments");

        doc.moveDown(0.5);

        doc
            .font("Helvetica")
            .text(data.comments || "No comments provided");

        doc.moveDown(2);

        doc
            .fontSize(11)
            .fillColor("gray")
            .text(
                "Generated by TYLT Mobility Feedback Management System",
                {
                    align: "center"
                }
            );

        doc.end();

    } catch (err) {

        console.error(err);

        res.status(500).send(err.message);

    }

});

router.put("/edit-detail/:feedbackId", async (req, res) => {

    try {

        const {

            booking_id,
            customer_name,
            company_name,
            driver_name,
            vehicle_number,
            trip_date

        } = req.body;

        await db.execute(

            `UPDATE feedback
             SET
                booking_id=?,
                customer_name=?,
                company_name=?,
                driver_name=?,
                vehicle_number=?,
                trip_date=?
             WHERE feedback_id=?`,

            [

                booking_id,
                customer_name,
                company_name,
                driver_name,
                vehicle_number,
                trip_date,
                req.params.feedbackId

            ]

        );

        res.json({

            success:true,
            message:"Booking updated successfully"

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