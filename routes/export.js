// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const ExcelJS = require("exceljs");
// const PDFDocument = require("pdfkit");

// // Excel Export
// router.get("/excel", async (req, res) => {

//     const [rows] = await db.execute("SELECT * FROM feedback");

//     const workbook = new ExcelJS.Workbook();

//     const sheet = workbook.addWorksheet("Feedback");

//     sheet.columns = [

//         { header: "Booking", key: "booking_id" },
//         { header: "Customer", key: "customer_name" },
//         { header: "Company", key: "company_name" },
//         { header: "Driver", key: "driver_name" },
//         { header: "Rating", key: "overall_rating" }

//     ];

//     rows.forEach(r => sheet.addRow(r));

//     res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=feedback.xlsx"
//     );

//     await workbook.xlsx.write(res);

//     res.end();

// });

// // PDF Export
// router.get("/pdf", async (req, res) => {

//     const [rows] = await db.execute("SELECT * FROM feedback");

//     const doc = new PDFDocument();

//     res.setHeader(
//         "Content-Type",
//         "application/pdf"
//     );

//     res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=feedback.pdf"
//     );

//     doc.pipe(res);

//     doc.fontSize(22).text("TYLT Feedback Report");

//     doc.moveDown();

//     rows.forEach(r => {

//         doc.text(
//             `${r.booking_id} | ${r.customer_name} | ${r.company_name} | Rating: ${r.overall_rating}`
//         );

//     });

//     doc.end();

// });

// module.exports = router;

// const express = require("express");
// const PDFDocument = require("pdfkit");
// const db = require("../db");

// const router = express.Router();

// /*
//    Download Individual Feedback PDF
//    URL:
//    GET /api/export/feedback/FB1752856254
// */

// router.get("/feedback/:feedbackId", async (req, res) => {

//     try {

//         const feedbackId = req.params.feedbackId;

//         const [rows] = await db.execute(

//             "SELECT * FROM feedback WHERE feedback_id = ?",

//             [feedbackId]

//         );

//         if (rows.length === 0) {

//             return res.status(404).json({
//                 success: false,
//                 message: "Feedback not found"
//             });

//         }

//         const data = rows[0];

//         const tripDate = data.trip_date
//             ? new Date(data.trip_date).toLocaleDateString("en-GB")
//             : "";

//         const doc = new PDFDocument({
//             margin: 50,
//             size: "A4"
//         });

//         res.setHeader(
//             "Content-Type",
//             "application/pdf"
//         );

//         res.setHeader(
//             "Content-Disposition",
//             `attachment; filename=${data.booking_id}_Feedback.pdf`
//         );

//         doc.pipe(res);

//         // ===========================================
//         // HEADER
//         // ===========================================

//         doc
//             .fontSize(24)
//             .fillColor("#0d6efd")
//             .text("TYLT Mobility", {
//                 align: "center"
//             });

//         doc
//             .moveDown(0.3)
//             .fontSize(16)
//             .fillColor("black")
//             .text("Customer Feedback Report", {
//                 align: "center"
//             });

//         doc.moveDown(1.5);

//         // ===========================================
//         // TRIP DETAILS
//         // ===========================================

//         doc
//             .fontSize(15)
//             .fillColor("#0d6efd")
//             .text("Trip Details");

//         doc.moveDown(0.5);

//         doc.fontSize(12).fillColor("black");

//         doc.text(`Booking ID       : ${data.booking_id}`);
//         doc.text(`Customer Name    : ${data.customer_name}`);
//         doc.text(`Company          : ${data.company_name}`);
//         doc.text(`Trip Date        : ${tripDate}`);
//         doc.text(`Driver Name      : ${data.driver_name}`);
//         doc.text(`Vehicle Number   : ${data.vehicle_number}`);

//         doc.moveDown();

//         // ===========================================
//         // RATINGS
//         // ===========================================

//         doc
//             .fontSize(15)
//             .fillColor("#0d6efd")
//             .text("Service Ratings");

//         doc.moveDown(0.5);

//         doc.fontSize(12).fillColor("black");

//         doc.text(`Overall Experience     : ${data.overall_rating}`);
//         doc.text(`Driver Professionalism : ${data.driver_rating}`);
//         doc.text(`Vehicle Cleanliness    : ${data.cleanliness_rating}`);
//         doc.text(`Punctuality            : ${data.punctuality_rating}`);

//         doc.moveDown();

//         // ===========================================
//         // RECOMMENDATION
//         // ===========================================

//         doc
//             .fontSize(15)
//             .fillColor("#0d6efd")
//             .text("Recommendation");

//         doc.moveDown(0.5);

//         doc
//             .fontSize(12)
//             .fillColor("black")
//             .text(data.recommendation || "Not Provided");

//         doc.moveDown();

//         // ===========================================
//         // COMMENTS
//         // ===========================================

//         doc
//             .fontSize(15)
//             .fillColor("#0d6efd")
//             .text("Customer Comments");

//         doc.moveDown(0.5);

//         doc
//             .fontSize(12)
//             .fillColor("black")
//             .text(data.comments || "No comments provided.");

//         doc.moveDown(3);

//         // ===========================================
//         // FOOTER
//         // ===========================================

//         doc
//             .fontSize(10)
//             .fillColor("gray")
//             .text(
//                 "Generated by TYLT Mobility Feedback Management System",
//                 {
//                     align: "center"
//                 }
//             );

//         doc.end();

//     } catch (err) {

//         console.error(err);

//         res.status(500).json({
//             success: false,
//             message: err.message
//         });

//     }

// });

// module.exports = router;
const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../db");

const router = express.Router();


/*
=========================================================
TYLT MOBILITY
Professional Customer Feedback Report
=========================================================
*/

router.get("/feedback/:feedbackId", async (req, res) => {

      console.log("******** PDF ROUTE HIT ********");

       console.log(req.params.feedbackId);

    try {

        const feedbackId = req.params.feedbackId;

        const [rows] = await db.execute(

            "SELECT * FROM feedback WHERE feedback_id=?",

            [feedbackId]

        );

        if (!rows.length) {

            return res.status(404).json({

                success: false,
                message: "Feedback not found"

            });

        }

        const data = rows[0];

        const tripDate = data.trip_date
            ? new Date(data.trip_date).toLocaleDateString("en-GB")
            : "-";

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=TYLT_${data.booking_id}_Feedback_Report.pdf`
        );

        //--------------------------------------------------
        // PDF
        //--------------------------------------------------

        const doc = new PDFDocument({

            size: "A4",
            margin: 25,
            compress: true

        });

        doc.pipe(res);
        //--------------------------------------------------
// REGISTER UNICODE FONT
//--------------------------------------------------

        const fontPath = path.join(
            __dirname,
            "../fonts/NotoSans-Regular.ttf"
        );

        if (fs.existsSync(fontPath)) {
            doc.registerFont("Noto", fontPath);
        }

        console.log("Font Exists:", fs.existsSync(fontPath));
        console.log("Font Path:", fontPath);

        //--------------------------------------------------
        // COLORS
        //--------------------------------------------------

        const BLUE = "#0B63CE";
        const LIGHT = "#F7F9FC";
        const BORDER = "#D9DEE5";
        const DARK = "#2B2B2B";
        const GREEN = "#198754";
        const RED = "#DC3545";
        const GREY = "#6C757D";

        //--------------------------------------------------
        // PAGE SIZE
        //--------------------------------------------------

        const PAGE_WIDTH = 595;
        const CONTENT_X = 25;
        const CONTENT_WIDTH = 545;

        //--------------------------------------------------
        // LOGO
        //--------------------------------------------------

        const logoPath = path.resolve(
            __dirname,
            "..",
            "public",
            "Image",
            "logo(1).png"
        );

        if (fs.existsSync(logoPath)) {

            doc.image(
                logoPath,
                25,
                18,
                {
                    width: 46
                }
            );

        }

        //--------------------------------------------------
        // HEADER
        //--------------------------------------------------

        doc
            .font("Helvetica-Bold")
            .fontSize(20)
            .fillColor(BLUE)
            .text(
                "TYLT Mobility",
                82,
                22
            );

        doc
            .font("Helvetica")
            .fontSize(12)
            .fillColor(DARK)
            .text(
                "Customer Feedback Report",
                82,
                47
            );

        doc
            .fontSize(8)
            .fillColor(GREY)
            .text(
                `Generated : ${new Date().toLocaleString()}`,
                390,
                28,
                {
                    width:170,
                    align:"right"
                }
            );

        doc
            .moveTo(25,72)
            .lineTo(570,72)
            .strokeColor(BLUE)
            .lineWidth(1.5)
            .stroke();

        //--------------------------------------------------
        // HELPER FUNCTIONS
        //--------------------------------------------------

        function sectionHeader(title, y){

            doc
                .roundedRect(
                    CONTENT_X,
                    y,
                    CONTENT_WIDTH,
                    20,
                    4
                )
                .fill(BLUE);

            doc
                .fillColor("white")
                .font("Helvetica-Bold")
                .fontSize(11)
                .text(
                    title,
                    CONTENT_X+12,
                    y+5
                );

        }

        function drawField(
            label,
            value,
            x1,
            x2,
            y,
            width=140
        ){

            doc
                .font("Helvetica-Bold")
                .fontSize(9)
                .fillColor(DARK)
                .text(
                    label,
                    x1,
                    y
                );

            doc
                .font("Helvetica")
                .text(
                    value || "-",
                    x2,
                    y,
                    {
                        width:width,
                        ellipsis:true
                    }
                );

        }

        //--------------------------------------------------
        // START POSITION
        //--------------------------------------------------

        let y = 84;

        //--------------------------------------------------
        // BOOKING HEADER
        //--------------------------------------------------

        sectionHeader(
            "BOOKING INFORMATION",
            y
        );

        y += 20;

        //--------------------------------------------------
        // BOOKING BOX
        //--------------------------------------------------

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                88,
                4
            )
            .fillAndStroke(
                LIGHT,
                BORDER
            );

        const leftLabel = 40;
        const leftValue = 135;

        const rightLabel = 305;
        const rightValue = 420;

        let row = y + 10;

        drawField(
            "Booking ID",
            data.booking_id,
            leftLabel,
            leftValue,
            row
        );

        drawField(
            "Driver",
            data.driver_name,
            rightLabel,
            rightValue,
            row,
            110
        );

        row += 18;

        drawField(
            "Customer",
            data.customer_name,
            leftLabel,
            leftValue,
            row
        );

        drawField(
            "Vehicle",
            data.vehicle_number,
            rightLabel,
            rightValue,
            row,
            110
        );

        row += 18;

        drawField(
            "Company",
            data.company_name,
            leftLabel,
            leftValue,
            row
        );

        drawField(
            "Trip Date",
            tripDate,
            rightLabel,
            rightValue,
            row,
            110
        );

        row += 18;

        drawField(
            "Status",
            "",
            leftLabel,
            leftValue,
            row
        );

        doc
            .font("Helvetica-Bold")
            .fillColor(GREEN)
            .text(
                "Completed",
                leftValue,
                row
            );

        //--------------------------------------------------
        // Move to Ratings Section
        //--------------------------------------------------

        y += 100;
        //--------------------------------------------------
        // HELPER : Extract Rating
        //--------------------------------------------------

        function getRating(value) {

            if (value === null || value === undefined)
                return 0;

            value = String(value).trim();

            if (value === "")
                return 0;

            // Already numeric
            if (!isNaN(value))
                return Number(value);

            // Count ⭐ emoji
            let count = (value.match(/⭐/g) || []).length;

            if (count > 0)
                return count;

            // Count ★
            count = (value.match(/★/g) || []).length;

            if (count > 0)
                return count;

            // Text values
            value = value.toLowerCase();

            if (value.includes("excellent"))
                return 5;

            if (value.includes("very good"))
                return 4;

            if (value.includes("good"))
                return 3;

            if (value.includes("average"))
                return 2;

            if (value.includes("poor"))
                return 1;

            return 0;

        }

        //--------------------------------------------------
        // HELPER : Draw Stars
        //--------------------------------------------------

        function stars(value) {

            const rating = getRating(value);

            let output = "";

            for (let i = 1; i <= 5; i++) {

                output += i <= rating ? "★" : "☆";

            }

            return output;

        }

        //--------------------------------------------------
        // SERVICE RATINGS
        //--------------------------------------------------

        sectionHeader(
            "SERVICE RATINGS",
            y
        );

        y += 20;

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                100,
                4
            )
            .fillAndStroke(
                LIGHT,
                BORDER
            );

        const ratingLabelX = 40;
        const starX = 255;
        const scoreX = 500;

        let ratingY = y + 12;

        console.log("Overall :", data.overall_rating);
        console.log("Driver :", data.driver_rating);
        console.log("Clean :", data.cleanliness_rating);
        console.log("Punctuality :", data.punctuality_rating);

        // function drawStars(rating, x, y) {

        //     rating = getRating(rating);

        //     for (let i = 0; i < 5; i++) {

        //         doc
        //             .fillColor(i < rating ? "#F4B400" : "#D3D3D3")
        //             .circle(x + i * 16, y + 8, 5)
        //             .fill();
        //     }

        // }

        function drawStar(cx, cy, spikes, outerRadius, innerRadius) {

            let rot = Math.PI / 2 * 3;
            let step = Math.PI / spikes;

            doc.moveTo(cx, cy - outerRadius);

            for (let i = 0; i < spikes; i++) {

                let x = cx + Math.cos(rot) * outerRadius;
                let y = cy + Math.sin(rot) * outerRadius;

                doc.lineTo(x, y);

                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;

                doc.lineTo(x, y);

                rot += step;
            }

            doc.closePath().fill();
        }

        function drawRating(value, x, y){

            const rating = getRating(value);

            for(let i=0;i<5;i++){

                doc.fillColor(
                    i<rating ? "#F4B400" : "#D9DEE5"
                );

                drawStar(
                    x + i*20,
                    y + 8,
                    5,
                    7,
                    3
                );
            }
        }

        function ratingRow(title, value) {

            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(DARK)
                .text(
                    title,
                    ratingLabelX,
                    ratingY,
                    {
                        width:170
                    }
                );

            doc
                .font(fs.existsSync(fontPath) ? "Noto" : "Helvetica")
                .fontSize(13)
                .fillColor("#F4B400")
                // .text(
                //     stars(value),
                //     starX,
                //     ratingY,
                //     {
                //         width:120,
                //         align:"center"
                //     }
                // );
                drawRating(value, starX, ratingY);

                console.log("Using Font:", fs.existsSync(fontPath) ? "Noto" : "Helvetica");
                console.log("Stars String:", stars(value));

            doc
                .font(fs.existsSync(fontPath) ? "Noto" : "Helvetica")
                .fontSize(10)
                .fillColor(BLUE)
                .text(
                    `${getRating(value)}/5`,
                    scoreX,
                    ratingY,
                    {
                        width:40,
                        align:"right"
                    }
                );

            ratingY += 22;

        }

        ratingRow(
            "Overall Experience",
            data.overall_rating
        );

        ratingRow(
            "Driver Professionalism",
            data.driver_rating
        );

        ratingRow(
            "Vehicle Cleanliness",
            data.cleanliness_rating
        );

        ratingRow(
            "Punctuality",
            data.punctuality_rating
        );

        y += 112;

        //--------------------------------------------------
        // RECOMMENDATION
        //--------------------------------------------------

        sectionHeader(
            "CUSTOMER RECOMMENDATION",
            y
        );

        y += 20;

        let recommendation =
            (data.recommendation || "")
            .toLowerCase()
            .trim();

        let recommendText = "Not Provided";
        let recommendColor = GREY;

        if (
            recommendation === "yes" ||
            recommendation === "recommended"
        ) {

            recommendText = "RECOMMENDED";
            recommendColor = GREEN;

        }
        else if (
            recommendation === "no" ||
            recommendation === "not recommended"
        ) {

            recommendText = "NOT RECOMMENDED";
            recommendColor = RED;

        }
        else if (
            recommendation === "maybe"
        ) {

            recommendText = "MAYBE";
            recommendColor = "#F4B400";

        }

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                34,
                4
            )
            .fillAndStroke(
                "#FFFFFF",
                BORDER
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor(recommendColor)
            .text(
                recommendText,
                CONTENT_X,
                y + 10,
                {
                    width:CONTENT_WIDTH,
                    align:"center"
                }
            );

        y += 45;

        //--------------------------------------------------
        // CUSTOMER COMMENTS
        //--------------------------------------------------

        sectionHeader(
            "CUSTOMER COMMENTS",
            y
        );

        y += 20;

        const comments =
            data.comments &&
            data.comments.trim() !== ""
                ? data.comments
                : "No comments were provided by the customer.";

        //--------------------------------------------------
        // Auto-fit comments box
        //--------------------------------------------------

        doc
            .font("Helvetica")
            .fontSize(9);

        let commentHeight =
            doc.heightOfString(
                comments,
                {
                    width:500,
                    align:"justify"
                }
            );

        commentHeight = Math.min(
            Math.max(commentHeight,28),
            55
        );

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                commentHeight + 14,
                4
            )
            .fillAndStroke(
                "#FFFFFF",
                BORDER
            );

        doc
            .fillColor(DARK)
            .font("Helvetica")
            .fontSize(9)
            .text(
                comments,
                40,
                y + 8,
                {
                    width:500,
                    height:commentHeight,
                    align:"justify",
                    ellipsis:true
                }
            );

        y += commentHeight + 24;

        //--------------------------------------------------
        // Average Rating
        //--------------------------------------------------

        const ratings = [

            getRating(data.overall_rating),
            getRating(data.driver_rating),
            getRating(data.cleanliness_rating),
            getRating(data.punctuality_rating)

        ];

        const average =
            ratings.reduce((a, b) => a + b, 0) / ratings.length;
        //--------------------------------------------------
        // OVERALL SERVICE SUMMARY
        //--------------------------------------------------

        sectionHeader(
            "OVERALL SERVICE SUMMARY",
            y
        );

        y += 20;

        let satisfaction = "";
        let scoreColor = "";

        if (average >= 4.5) {

            satisfaction = "Excellent";
            scoreColor = GREEN;

        } else if (average >= 3.5) {

            satisfaction = "Very Good";
            scoreColor = BLUE;

        } else if (average >= 2.5) {

            satisfaction = "Good";
            scoreColor = "#F39C12";

        } else {

            satisfaction = "Needs Improvement";
            scoreColor = RED;

        }

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                52,
                4
            )
            .fillAndStroke(
                "#FFFFFF",
                BORDER
            );

        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(DARK)
            .text(
                "Average Rating",
                45,
                y + 18
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(20)
            .fillColor(scoreColor)
            .text(
                average.toFixed(1) + " / 5",
                220,
                y + 12
            );

        doc
            .font("Helvetica-Bold")
            .fontSize(15)
            .fillColor(scoreColor)
            .text(
                satisfaction,
                390,
                y + 16
            );

        y += 62;

        //--------------------------------------------------
        // THANK YOU
        //--------------------------------------------------

        doc
            .roundedRect(
                CONTENT_X,
                y,
                CONTENT_WIDTH,
                48,
                4
            )
            .fill("#F8F9FA")
            .stroke(BORDER);

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(DARK)
            .text(
                "Thank you for choosing TYLT Mobility",
                CONTENT_X,
                y + 10,
                {
                    width: CONTENT_WIDTH,
                    align: "center"
                }
            );

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(GREY)
            .text(
                "Your valuable feedback helps us continuously improve our transportation services and deliver a better customer experience.",
                40,
                y + 25,
                {
                    width: 515,
                    align: "center"
                }
            );

        y += 58;

        //--------------------------------------------------
        // GENERATED INFORMATION
        //--------------------------------------------------

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(GREY);

        doc.text(
            `Generated On : ${new Date().toLocaleString()}`,
            30,
            y
        );

        doc.text(
            `Feedback ID : ${data.feedback_id}`,
            230,
            y
        );

        doc.text(
            `Booking ID : ${data.booking_id}`,
            420,
            y
        );

        //--------------------------------------------------
        // FOOTER
        //--------------------------------------------------

        const footerY = 760;

        doc
            .moveTo(25, footerY)
            .lineTo(570, footerY)
            .strokeColor(BORDER)
            .lineWidth(1)
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(GREY);

            doc.text("TYLT Mobility Pvt. Ltd.",25,768,{
            lineBreak:false
            });

            doc.text("Customer Feedback Management System",180,768,{
                width:220,
                align:"center",
                lineBreak:false
            });

            doc.text("Confidential • Auto Generated Report",410,768,{
                width:150,
                align:"right",
                lineBreak:false
            });

        // doc.text(
        //     "TYLT Mobility Pvt. Ltd.",
        //     25,
        //     footerY + 8
        // );

        // doc.text(
        //     "Customer Feedback Management System",
        //     0,
        //     footerY + 8,
        //     {
        //         width: 595,
        //         align: "center"
        //     }
        // );

        // doc.text(
        //     "Confidential • Auto Generated Report",
        //     0,
        //     footerY + 8,
        //     {
        //         width: 565,
        //         align: "right"
        //     }
        // );

        //--------------------------------------------------
        // FINISH PDF
        //--------------------------------------------------

        doc.end();

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

});

module.exports = router;
//--------------------------------------------------
// HELPER : Draw Section Header
//--------------------------------------------------

function drawSection(title, y) {

    doc
        .roundedRect(25, y, 545, 20, 4)
        .fill(BLUE);

    doc
        .fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(title, 38, y + 5);

}

//--------------------------------------------------
// HELPER : Draw Label & Value
//--------------------------------------------------

function drawField(label, value, x1, x2, y, width = 140) {

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(DARK)
        .text(label, x1, y);

    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(DARK)
        .text(
            value || "-",
            x2,
            y,
            {
                width,
                ellipsis: true
            }
        );

}

//--------------------------------------------------
// HELPER : Rating Stars
//--------------------------------------------------

function drawStars(value) {

    value = Number(value || 0);

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        stars += i <= value ? "★ " : "☆ ";

    }

    return stars;

}

//--------------------------------------------------
// HELPER : Satisfaction Level
//--------------------------------------------------

function getSatisfaction(avg) {

    if (avg >= 4.5) {

        return {
            text: "Excellent",
            color: GREEN
        };

    }

    if (avg >= 3.5) {

        return {
            text: "Very Good",
            color: BLUE
        };

    }

    if (avg >= 2.5) {

        return {
            text: "Good",
            color: "#F39C12"
        };

    }

    return {
        text: "Needs Improvement",
        color: RED
    };

}

//--------------------------------------------------
// HELPER : Auto Fit Comment Box
//--------------------------------------------------

function drawCommentBox(text, y) {

    text =
        text && text.trim() !== ""
            ? text
            : "No comments were provided by the customer.";

    const textHeight = doc.heightOfString(text, {

        width: 500,

        align: "justify"

    });

    const boxHeight = Math.min(
        Math.max(textHeight + 12, 45),
        70
    );

    doc
        .roundedRect(
            25,
            y,
            545,
            boxHeight,
            4
        )
        .fillAndStroke(
            "#FFFFFF",
            BORDER
        );

    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(DARK)
        .text(
            text,
            40,
            y + 8,
            {
                width: 500,
                height: boxHeight - 10,
                align: "justify",
                ellipsis: true
            }
        );

    return boxHeight;

}

//--------------------------------------------------
// HELPER : Footer
//--------------------------------------------------

function drawFooter() {

    const footerY = 795;

    doc
        .moveTo(25, footerY)
        .lineTo(570, footerY)
        .strokeColor("#DADADA")
        .lineWidth(1)
        .stroke();

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#777777");

    doc.text(
        "TYLT Mobility Pvt. Ltd.",
        25,
        footerY + 8
    );

    doc.text(
        "Customer Feedback Management System",
        0,
        footerY + 8,
        {
            width: 595,
            align: "center"
        }
    );

    doc.text(
        "Confidential • Auto Generated Report",
        0,
        footerY + 8,
        {
            width: 565,
            align: "right"
        }
    );

}