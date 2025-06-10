const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const pool = require("./config/db");

// Route imports
const applicantCreateRoutes = require("./routes/applicantCreateRoutes");
const applicantViewRoutes = require("./routes/applicantViewRoutes");
const applicantUpdateRoutes = require("./routes/applicantUpdateRoutes");
const applicantDeleteRoutes = require("./routes/applicantDeleteRoutes");
const bulkUploadRoutes = require("./routes/bulkUploadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const jurisdictionRoutes = require("./routes/jurisdictionRoutes");
const districtRoutes = require("./routes/districtRoutes");
const institutesRoutes = require("./routes/institutesRoutes");
const jurisNames = require("./routes/jurisNames");
const generateShortlistRoutes = require("./routes/generateShortlistRoutes");
const shortlistInfoRoutes = require("./routes/shorlistInfoRoutes");
const examRoutes = require("./routes/examRoutes");
const examCentres = require("./routes/examRoutes");
const authRoutes = require("./routes/Auth/LoginRouter");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

// Static files
app.use(
  "/uploads/profile_photos",
  express.static(path.join(__dirname, "uploads", "profile_photos"))
);
app.use("/logs", express.static(path.join(__dirname, "logs")));

// Applicant Routes
app.use("/applicants/create", applicantCreateRoutes);
app.use("/applicants", applicantViewRoutes);
app.use("/applicants/update", applicantUpdateRoutes);
app.use("/applicants/delete", applicantDeleteRoutes);

// Other API Routes
app.use("/api", bulkUploadRoutes);
app.use("/api", searchRoutes);
app.use("/api", jurisdictionRoutes);
app.use("/api", generateShortlistRoutes);
app.use("/api/shortlists", shortlistInfoRoutes);

// Jurisdiction Info
app.use("/", institutesRoutes);
app.use("/", districtRoutes);
app.use("/", jurisNames);

//Creste Exam
app.use("/api/exams", examRoutes);
app.use(
  "/halltickets",
  express.static(path.join(__dirname, "public/halltickets"))
);
app.use("/api/exam-centres", examCentres);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
