const examModel = require("../models/examModels");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require("../config/db");
const archiver = require('archiver');

// Generate a simple hall ticket number
function generateHallTicket(applicantId, examId) {
  return `HT${examId}${applicantId}`; // Example: HT5-1023
}

async function createExamAndAssignApplicants(req, res) {
  const { centreId, Exam_name, date, district, blocks } = req.body;

  if (!centreId || !Exam_name || !date || !district || !blocks || blocks.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Only insert into examination table using the passed centreId
    const examInsertResult = await client.query(`
      INSERT INTO pp.examination (exam_name, exam_date, pp_exam_centre_id)
      VALUES ($1, $2, $3)
      RETURNING exam_id
    `, [Exam_name, date, centreId]);

    const examId = examInsertResult.rows[0].exam_id;

    // ✅ Fetch shortlisted applicants
    // Modify the query in createExamAndAssignApplicants
    const applicantsResult = await client.query(`
      SELECT DISTINCT api.applicant_id
         FROM pp.applicant_primary_info api
         JOIN pp.shortlist_info si 
           ON api.applicant_id = si.applicant_id
         WHERE api.nmms_block = ANY($1)
           AND si.shortlisted_yn = 'Y'
    `, [blocks]);
    

    const applicants = applicantsResult.rows;

    if (applicants.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "No applicants found for the selected blocks." });
    }

    // ✅ Generate PDFs and prepare entries
    const applicantExams = [];

    for (const applicant of applicants) {
      const hallTicketNo = generateHallTicket(applicant.applicant_id, examId);

      const doc = new PDFDocument();
      const dirPath = path.join(__dirname, `../public/halltickets`);
      const pdfPath = path.join(dirPath, `hall_ticket_${applicant.applicant_id}_${applicant.blocks}.pdf`);
      // const pdfPath = path.join(dirPath, `hall_ticket_${applicant.applicant_id}_${applicant.blocks}.pdf`);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      doc.fontSize(20).text('Hall Ticket', { align: 'center' });
      doc.moveDown();
      doc.text(`hall ticket No.: ${hallTicketNo}`)
      doc.fontSize(12).text(`Name: ${applicant.student_name}`);
      doc.text(`Father Name: ${applicant.father_name}`);
      doc.text(`Mother Name: ${applicant.mother_name}`);
      doc.text(`DOB: ${new Date(applicant.dob).toLocaleDateString()}`);
      doc.text(`Aadhaar: ${applicant.aadhaar}`);
      doc.text(`School Dise Code: ${applicant.current_institute_dise_code}`);
      doc.text(`Phone No 1: ${applicant.contact_no1}`);
      doc.text(`Phone No 2: ${applicant.contact_no2}`);
     

      doc.end();

      applicantExams.push({
        applicant_id: applicant.applicant_id,
        exam_id: examId,
        hall_ticket_no: hallTicketNo,
      });
    }

    // ✅ Insert applicant exams into database
    for (const a of applicantExams) {
      await client.query(`
        INSERT INTO pp.applicant_exam (applicant_id, exam_id, pp_hall_ticket_no)
        VALUES ($1, $2, $3)
      `, [a.applicant_id, a.exam_id, a.hall_ticket_no]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Exam created and applicants assigned successfully ✅",
      examId: examId,//need to send the centre name and district name and block anme not its it 
      applicants: applicants.map(applicant => ({
        applicant_id: applicant.applicant_id,
        applicant_name: applicant.student_name, // 👈 Add this line
        hall_ticket_url: `/halltickets/hall_ticket_${applicant.applicant_id}.pdf`
      }))
    });
    

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  } finally {
    client.release();
  }
}
////////////////////////////////////////////delete the exam id

const deleteExam = async (req, res) => {
  const examId = req.params.examId;

  try {
    // Begin transaction
    await pool.query("BEGIN");

    // Delete related applicant_exam entries
    await pool.query(
      "DELETE FROM pp.applicant_exam WHERE exam_id = $1",
      [examId]
    );

    // Delete the exam itself
    await pool.query(
      "DELETE FROM pp.examination WHERE exam_id = $1",
      [examId]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.status(200).json({ message: "Exam and related data deleted successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error deleting exam and related data:", error);
    res.status(500).json({ message: "Failed to delete exam and related data" });
  }
};


////////////////////////////////////////////////////////////////////////
async function generateStudentList(req, res) {
  try {
    const examId = req.params.examId;
    const logoPath = path.join(__dirname, '../../client/src/assets/logo.png');

    const result = await pool.query(`
      SELECT ae.pp_hall_ticket_no, api.student_name, api.current_institute_dise_code, 
             api.contact_no1, api.contact_no2
      FROM pp.applicant_exam ae
      JOIN pp.applicant_primary_info api ON ae.applicant_id = api.applicant_id
      WHERE ae.exam_id = $1
    `, [examId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No students found for this exam." });
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../public/halltickets/Exm_studentlist_generated.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Add logo
    doc.image(logoPath, 50, 45, { width: 80 });
    
    // Add title
    doc.fontSize(20)
       .text("Student List", 150, 60, { align: 'center' });
    doc.moveDown(2);

    // Define table layout with adjusted dimensions
    const tableTop = 150;
    const rowHeight = 40; // Increased height for wrapped text
    const colWidths = [100, 130, 120, 80, 80]; // Adjusted column widths
    
    // Draw table headers
    doc.fontSize(10); // Slightly smaller font for better fit
    let currentX = 50;
    
    ['Hall Ticket No', 'Student Name', 'School Code', 'Contact NO.1', 'Contact NO.2'].forEach((header, i) => {
      doc.rect(currentX, tableTop, colWidths[i], rowHeight).stroke();
      doc.text(header, currentX + 5, tableTop + 10, {
        width: colWidths[i] - 10,
        align: 'left'
      });
      currentX += colWidths[i];
    });

    // Draw table rows with text wrapping
    let currentY = tableTop + rowHeight;
    
    result.rows.forEach((row) => {
      const rowData = [
        row.pp_hall_ticket_no || '',
        row.student_name || '',
        row.current_institute_dise_code || '',
        row.contact_no1 || '',
        row.contact_no2 || ''
      ];
      
      // Calculate required height for this row based on wrapped text
      const textHeight = Math.max(
        ...rowData.map(text => {
          const wrapped = doc.heightOfString(String(text), {
            width: colWidths[0] - 10
          });
          return wrapped;
        })
      );
      
      const actualRowHeight = Math.max(rowHeight, textHeight + 20);
      
      // Draw row cells with dynamic height
      currentX = 50;
      rowData.forEach((text, i) => {
        doc.rect(currentX, currentY, colWidths[i], actualRowHeight).stroke();
        doc.text(
          String(text),
          currentX + 5,
          currentY + 5,
          {
            width: colWidths[i] - 10,
            align: 'left'
          }
        );
        currentX += colWidths[i];
      });
      
      currentY += actualRowHeight;
      
      // Add new page if needed
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.end();

    stream.on('finish', () => {
      return res.download(filePath, "Exm_studentlist_generated.pdf");
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate PDF", error: err.message });
  }
}

/////////////////////////////zip file

async function downloadAllHallTickets(req, res) {
  const examId = req.params.examId;
  const dirPath = path.join(__dirname, `../public/halltickets`);
  const logoPath = path.join(__dirname, '../../client/src/assets/logo.png');

  try {
    // Create a zip stream
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename=All_Hall_Tickets_${examId}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe archive to the response
    archive.pipe(res);

    // Get all applicants for this exam
    const result = await pool.query(`
      SELECT ae.pp_hall_ticket_no, ae.applicant_id, api.student_name, 
             api.father_name, api.mother_name, api.dob, api.aadhaar,
             api.current_institute_dise_code, api.contact_no1, api.contact_no2
      FROM pp.applicant_exam ae
      JOIN pp.applicant_primary_info api ON ae.applicant_id = api.applicant_id
      WHERE ae.exam_id = $1
    `, [examId]);

    if (result.rows.length === 0) {
      throw new Error('No hall tickets found for this exam.');
    }

    // Generate individual hall tickets
    for (const student of result.rows) {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const ticketPath = path.join(dirPath, `hall_ticket_${student.pp_hall_ticket_no}.pdf`);
      const stream = fs.createWriteStream(ticketPath);
      doc.pipe(stream);

      // Add logo
      doc.image(logoPath, 50, 50, { width: 80 });

      // Add title
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor('#1a237e')
         .text('HALL TICKET', 100, 60, { align: 'center' });

      // Add photo box
      doc.rect(450, 50, 100, 120)
         .stroke()
         .fontSize(10)
         .text('Paste Recent\nPassport Size\nPhoto Here', 460, 90, { align: 'center' });

      // Add student information table
      doc.moveDown(4);
      const startY = 200;
      const lineHeight = 25;
      const labelX = 80;
      const valueX = 250;
      
      // Helper function for table rows
      function addTableRow(label, value, y) {
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fillColor('#000000')
           .text(label, labelX, y);
        doc.font('Helvetica')
           .text(': ' + (value || ''), valueX, y);
      }

      // Add student details
      addTableRow('Hall Ticket No', student.pp_hall_ticket_no, startY);
      addTableRow('Student Name', student.student_name, startY + lineHeight);
      addTableRow('Father\'s Name', student.father_name, startY + lineHeight * 2);
      addTableRow('Mother\'s Name', student.mother_name, startY + lineHeight * 3);
      addTableRow('Date of Birth', new Date(student.dob).toLocaleDateString(), startY + lineHeight * 4);
      addTableRow('Aadhaar Number', student.aadhaar, startY + lineHeight * 5);
      addTableRow('School Code', student.current_institute_dise_code, startY + lineHeight * 6);
      addTableRow('Contact No. 1', student.contact_no1, startY + lineHeight * 7);
      addTableRow('Contact No. 2', student.contact_no2 || '-', startY + lineHeight * 8);

      // Add signature box
      const signatureY = startY + lineHeight * 10;
      doc.rect(80, signatureY, 150, 60).stroke()
         .fontSize(10)
         .text('Student Signature', 100, signatureY + 65);

      // Add official signature box
      doc.rect(350, signatureY, 150, 60).stroke()
         .text('Authorized Signatory', 370, signatureY + 65);

      // Add footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text('This hall ticket must be preserved until the completion of the examination.', 50, 750, { align: 'center' });

      doc.end();

      // Add to archive
      archive.file(ticketPath, { name: `hall_ticket_${student.pp_hall_ticket_no}.pdf` });
    }

    // Finalize archive
    archive.finalize();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate hall tickets", error: error.message });
  }
}

module.exports = {
  createExamAndAssignApplicants,
  generateStudentList,
  deleteExam,
  downloadAllHallTickets
};

