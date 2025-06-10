const pool = require("../config/db");

// Create a new exam
async function createExam({ examName, examDate, examCentreId }) {
  const result = await pool.query(
    `INSERT INTO pp.examination (exam_name, exam_date, pp_exam_centre_id) 
     VALUES ($1, $2, $3) RETURNING exam_id`,
    [examName, examDate, examCentreId]
  );
  return result.rows[0];
}

// Get applicants based on selected blocks
// Modify the getShortlistedApplicants function
async function getShortlistedApplicants(blocks) {
  const result = await pool.query(
    // `SELECT api.applicant_id 
    //  FROM pp.applicant_primary_info api
    //  WHERE api.nmms_block = ANY($1)
    //  AND api.applicant_id IN (
    //      SELECT si.applicant_id 
    //      FROM pp.shortlist_info si
    //      INNER JOIN pp.shortlist_batch_jurisdiction sbj
    //      ON si.shortlist_batch_id = sbj.shortlist_batch_id
    //      WHERE si.shortlisted_yn = 'Y'
    //      AND sbj.juris_code = ANY($1)
    //  )`,
    [blocks]
  );
  return result.rows;
}

// Insert applicant exam data
async function insertApplicantExams(applicantExams) {
  const insertPromises = applicantExams.map(({ applicant_id, exam_id, hall_ticket_no }) => {
    return pool.query(
      `INSERT INTO pp.applicant_exam (applicant_id, exam_id, pp_hall_ticket_no) 
       VALUES ($1, $2, $3)`,
      [applicant_id, exam_id, hall_ticket_no]
    );
  });

  await Promise.all(insertPromises);
}

module.exports = {
  createExam,
  getShortlistedApplicants,
  insertApplicantExams,
};
