const express = require("express");
const router = express.Router();
const {createExamAndAssignApplicants,generateStudentList,deleteExam,downloadAllHallTickets} = require('../controllers/examControllers')
const pool = require("../config/db");

// POST /api/exams/create
router.post('/create', createExamAndAssignApplicants);
router.get('/:examId/student-list', generateStudentList); // <-- this line
router.delete("/:examId", deleteExam);
router.get("/:examId/download-all-hall-tickets", downloadAllHallTickets);


// GET /api/exams/exam-centres
router.get("/exam-centres", async (req, res) => {
  try {
    const centres = await pool.query(`
      SELECT pp_exam_centre_id, pp_exam_centre_name
      FROM pp.pp_exam_centre
      ORDER BY pp_exam_centre_name ASC
    `);
    res.status(200).json(centres.rows);
  } catch (error) {
    console.error("Error fetching exam centres:", error);
    res.status(500).json({ error: "Failed to fetch exam centres" });
  }
});

// POST /api/exams/exam-centres
router.post("/exam-centres", async (req, res) => {
  const { pp_exam_centre_name } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO pp.pp_exam_centre (pp_exam_centre_name) VALUES ($1) RETURNING *",
      [pp_exam_centre_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ message: "Failed to create centre" });
  }
});


// DELETE /api/exams/exam-centres/:id
router.delete("/exam-centres/:id", async (req, res) => {
  const id = req.params.id;
  await pool.query("DELETE FROM pp.pp_exam_centre WHERE pp_exam_centre_id = $1", [id]);
  res.status(204).send();
});


//get the all the districts and state and etc


// Fetch all states
router.get("/states", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT JURIS_CODE AS id, JURIS_NAME AS name
            FROM PP.JURISDICTION 
            WHERE JURIS_TYPE = 'STATE' AND PARENT_JURIS IS NULL
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching states:", error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch districts based on state ID
router.get("/districts-by-state/:stateId", async (req, res) => {
    try {
        const { stateId } = req.params;
        const result = await pool.query(`
            SELECT JURIS_CODE AS id, JURIS_NAME AS name 
            FROM PP.JURISDICTION 
            WHERE JURIS_TYPE = 'EDUCATION DISTRICT' 
            AND PARENT_JURIS = $1
        `, [stateId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching districts:", error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch blocks based on district name
router.get("/blocks-by-district/:districtId", async (req, res) => {
    try {
        const { districtId } = req.params;
        const result = await pool.query(`
            SELECT JURIS_CODE AS id, JURIS_NAME AS name 
            FROM PP.JURISDICTION 
            WHERE JURIS_TYPE = 'BLOCK' 
            AND PARENT_JURIS = $1
        `, [districtId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching blocks:", error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/blocks-by-district/:districtId", async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await pool.query(`
      SELECT JURIS_CODE AS id, JURIS_NAME AS name 
      FROM PP.JURISDICTION 
      WHERE JURIS_TYPE = 'BLOCK' 
      AND PARENT_JURIS = $1
    `, [districtId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching blocks:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET /api/exams/used-blocks
router.get("/used-blocks", async (req, res) => {
  try {
    const { blockId } = req.query;

    let result;

    if (blockId) {
      result = await pool.query(`
        SELECT DISTINCT api.nmms_block
        FROM pp.applicant_primary_info api
        INNER JOIN pp.applicant_exam ae ON api.applicant_id = ae.applicant_id
        WHERE api.nmms_block = $1
      `, [blockId]);
    } else {
      result = await pool.query(`
        SELECT DISTINCT api.nmms_block
        FROM pp.applicant_primary_info api
        INNER JOIN pp.applicant_exam ae ON api.applicant_id = ae.applicant_id
      `);
    }

    const usedBlocks = result.rows.map(row => Number(row.nmms_block));
    res.json(usedBlocks);
  } catch (error) {
    console.error("Error fetching used blocks:", error);
    res.status(500).json({ error: "Failed to fetch used blocks" });
  }
});


module.exports = router;
