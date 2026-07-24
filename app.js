const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const defaultAllowedOrigins = [
    "http://localhost:3000"
];

const extraAllowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...extraAllowedOrigins])];

app.use(cors({
    origin(origin, callback) {
        // Allow server-to-server and non-browser requests with no origin.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));
app.use(express.json());

const feedbackRoutes = require("./routes/feedback");
const dashboardRoutes = require("./routes/dashboard");
const listFeedbackRoutes = require("./routes/listFeedback");
const analyticsRoutes = require("./routes/analytics");
const exportRoutes = require("./routes/export");
const generateLink = require("./routes/generateLink");

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/list-feedback", listFeedbackRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/generate-link", generateLink);
app.get("/", (req, res) => {
    res.send("TYLT Feedback API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
