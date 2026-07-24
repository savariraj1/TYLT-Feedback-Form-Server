const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
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
