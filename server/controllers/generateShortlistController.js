// Controller (generateShortlistController.js)
const GenerateShortlistModel = require("../models/generateShortlistModel");
const pool = require("../config/db"); // Import your database connection

const generateShortlistController = {
  getStates: async (req, res) => {
    console.log("Controller: getStates - Entered");
    try {
      const states = await GenerateShortlistModel.getAllStates();
      console.log("Controller: getStates - Success", states);
      res.json(states);
    } catch (error) {
      console.error("Controller: getStates - Error:", error);
      res.status(500).json({ message: "Error fetching states", error: error.message, details: error.stack });
    }
  },

  getDistricts: async (req, res) => {
    const { stateName } = req.params;
    console.log("Controller: getDistricts - Entered", { stateName });
    try {
      const districts = await GenerateShortlistModel.getDistrictsByState(stateName);
      console.log("Controller: getDistricts - Success", districts);
      res.json(districts);
    } catch (error) {
      console.error("Controller: getDistricts - Error:", error);
      res.status(500).json({ message: "Error fetching districts", error: error.message, details: error.stack });
    }
  },

  getBlocks: async (req, res) => {
    const { districtName } = req.params;
    console.log("Controller: getBlocks - Entered", { districtName });
    try {
      const blocks = await GenerateShortlistModel.getBlocksByDistrict(districtName);
      console.log("Controller: getBlocks - Success", blocks);
      res.json(blocks);
    } catch (error) {
      console.error("Controller: getBlocks - Error:", error);
      res.status(500).json({ message: "Error fetching blocks", error: error.message, details: error.stack });
    }
  },

  getCriteria: async (req, res) => {
    console.log("Controller: getCriteria - Entered");
    try {
      const criteria = await GenerateShortlistModel.getCriteria();
      console.log("Controller: getCriteria - Success", criteria);
      res.json(criteria);
    } catch (error) {
      console.error("Controller: getCriteria - Error:", error);
      res.status(500).json({ message: "Error fetching criteria", error: error.message, details: error.stack });
    }
  },

  startShortlisting: async (req, res) => {
    console.log("Controller: startShortlisting - Entered", req.body);
    try {
      const { criteriaId, locations, name, description } = req.body;
      const { state, district, blocks } = locations;

      if (!state || !district || !criteriaId || !name || !description) {
        console.warn("Controller: startShortlisting - Missing required fields");
        return res.status(400).json({ error: "State, district, criteria, name, and description are required." });
      }

<<<<<<< HEAD
      const result = await GenerateShortlistModel.createShortlistBatch(
        name,
        description,
        criteriaId,
        blocks,
        state,
        district
      );
=======
      try {
        const result = await GenerateShortlistModel.createShortlistBatch(
          name,
          description,
          criteriaId,
          blocks,
          state,
          district
        );
>>>>>>> e7a48c159d4ace8483cebe22797c96a735dc6ac7

      console.log("Controller: startShortlisting - Success", result);

<<<<<<< HEAD
      // Fetch counts after successful shortlisting
      const totalApplicantsResult = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.applicant_primary_info');
      const totalApplicantsCount = totalApplicantsResult.rows[0].count;

      const shortlistedStudentsResult = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.shortlist_info WHERE shortlisted_yn = \'Y\'');
      const shortlistedStudentsCount = shortlistedStudentsResult.rows[0].count;

      res.status(200).json({
        message: "Shortlisting process started successfully.  Successfully done the shortlisting",
        shortlistBatchId: result.shortlistBatchId,
        shortlistedCount: result.shortlistedCount,
        shortlistedApplicantIds: result.shortlistedApplicantIds,
        totalApplicantsCount: totalApplicantsCount,  // Include total count
        shortlistedStudentsCount: shortlistedStudentsCount, // Include shortlisted count
      });
=======
        // Fetch counts after successful shortlisting
        const totalApplicantsResult = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.applicant_primary_info');
        const totalApplicantsCount = totalApplicantsResult.rows[0].count;

        const shortlistedStudentsResult = await pool.query('SELECT COUNT(DISTINCT applicant_id) as count FROM pp.shortlist_info WHERE shortlisted_yn = \'Y\'');
        const shortlistedStudentsCount = shortlistedStudentsResult.rows[0].count;

        res.status(200).json({
          message: "Shortlisting process started successfully.",
          shortlistBatchId: result.shortlistBatchId,
          shortlistedCount: result.shortlistedCount,
          totalApplicantsCount: totalApplicantsCount,   // Include total count
          shortlistedStudentsCount: shortlistedStudentsCount, // Include shortlisted count
        });
      } catch (modelError) {
        // Check if the error came from the model due to existing shortlists
        if (modelError.message.startsWith("Shortlists already exist")) {
          return res.status(409).json({ error: modelError.message }); // Send a 409 Conflict status
        }
        // For other errors from the model, propagate them
        console.error("Controller: startShortlisting - Model Error:", modelError);
        return res.status(500).json({ message: "Error during shortlist creation", error: modelError.message, details: modelError.stack });
      }
>>>>>>> e7a48c159d4ace8483cebe22797c96a735dc6ac7
    } catch (error) {
      console.error("Controller: startShortlisting - Error:", error);
      res.status(500).json({ message: "Error starting shortlisting", error: error.message, details: error.stack });
    }
  },

  getTotalApplicants: async (req, res) => {
    try {
      const result = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.applicant_primary_info');
      res.json({ count: result.rows[0].count });
    } catch (error) {
      console.error("Error fetching total applicants:", error);
      res.status(500).json({ error: "Failed to fetch total applicants" });
    }
  },

  getShortlistedStudents: async (req, res) => {
    try {
<<<<<<< HEAD
<<<<<<< HEAD
      const result = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.shortlist_info WHERE shortlisted_yn = \'Y\'');
=======
      const result = await pool.query('SELECT COUNT(applicant_id) as count FROM pp.shortlist_info WHERE shortlisted_yn = \'Y\' AND shortlist_batch_id = $1', [batchId]);
>>>>>>> e7a48c159d4ace8483cebe22797c96a735dc6ac7
=======
      const result = await pool.query('SELECT COUNT(DISTINCT applicant_id) as count FROM pp.shortlist_info WHERE shortlisted_yn = \'Y\'');
>>>>>>> parent of e7a48c1 (first commit)
      res.json({ count: result.rows[0].count });
    } catch (error) {
      console.error("Error fetching shortlisted students:", error);
      res.status(500).json({ error: "Failed to fetch shortlisted students" });
    }
  }
};

module.exports = generateShortlistController;