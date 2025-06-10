import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import useCreateExamHooks from "../hooks/CreateExamHooks";
import styles from "./CreateExam.module.css";

const CreateExam = () => {
  const {
    entries,
    showForm,
    setShowForm,
    districts,
    blocks,
    loading,
    message,
    assignedApplicants,
    centres,
    newCentreName,
    setNewCentreName,
    formData,
    setFormData,
    handleChange,
    handleBlockCheckboxChange,
    handleSubmit,
    createCentre,
    deleteCentre,
    createdExamId,
    deleteExam,
    examBlocks,
    usedBlocks,
  } = useCreateExamHooks();

  const [showNewCentreInput, setShowNewCentreInput] = useState(false);
  const [centreAdded, setCentreAdded] = useState(false);

  const handleCentreSelect = (e) => {
    const selected = e.target.value;
    if (selected === "other") {
      setShowNewCentreInput(true);
      setCentreAdded(false);
      setFormData({ ...formData, centreId: "" });
    } else {
      setShowNewCentreInput(false);
      setFormData({ ...formData, centreId: selected });
    }
  };

  const handleAddCentre = async () => {
    if (!newCentreName.trim()) return;
    const createdId = await createCentre();
    if (createdId) {
      setFormData({ ...formData, centreId: createdId });
      setCentreAdded(true);
      setShowNewCentreInput(false);
      setNewCentreName("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Exam List</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={styles.createButton}
          >
            <FaPlus /> Create New Exam
          </button>
        )}
      </div>

      <div className={styles.examGrid}>
        {entries.map((entry, index) => (
          <div key={index} className={styles.examCard}>
            <h3>Exam ID: {entry.examId}</h3>
            <p>
              <strong>Centre:</strong>{" "}
              {centres.find(
                (c) => String(c.pp_exam_centre_id) === String(entry.centreId)
              )?.pp_exam_centre_name || "Unknown"}
            </p>
            <p>
              <strong>Exam Name:</strong> {entry.examName}
            </p>
            <p>
              <strong>Date:</strong> {entry.examDate}
            </p>
            <p>
              <strong>District:</strong>{" "}
              {districts.find((d) => Number(d.id) === Number(entry.district))
                ?.name || "Unknown"}
            </p>
            <p>
              <strong>Blocks:</strong>{" "}
              {entry.blocks
                .map((blockId) => {
                  const districtBlocks = examBlocks[entry.district] || [];
                  const block =
                    districtBlocks.find(
                      (b) => Number(b.id) === Number(blockId)
                    ) || blocks.find((b) => Number(b.id) === Number(blockId));
                  return block ? block.name : "Unknown";
                })
                .join(", ")}
            </p>

            {entry.examId && (
              <div className={styles.actionButtons}>
                <a
                  href={`http://localhost:5000/api/exams/${entry.examId}/student-list`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`StudentList_Exam_${entry.examId}.pdf`}
                >
                  <button
                    className={`${styles.actionButton} ${styles.downloadButton}`}
                  >
                    📄 Student List
                  </button>
                </a>
                <button
                  onClick={() => deleteExam(entry.examId)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  🗑 Delete
                </button>
                <a
                  href={`http://localhost:5000/api/exams/${entry.examId}/download-all-hall-tickets`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`HallTickets_Exam_${entry.examId}.zip`}
                >
                  <button
                    className={`${styles.actionButton} ${styles.downloadButton}`}
                  >
                    Download all Hall Tickets
                  </button>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formSection}>
          <h4>Create New Exam</h4>

          <div className={styles.formGroup}>
            <label>Select Exam Centre:</label>
            <select
              name="centreId"
              value={formData.centreId}
              onChange={handleCentreSelect}
              required
              className={styles.select}
            >
              <option value="">-- Choose Centre --</option>
              {centres.map((centre) => (
                <option
                  key={centre.pp_exam_centre_id}
                  value={centre.pp_exam_centre_id}
                >
                  {centre.pp_exam_centre_name}
                </option>
              ))}
              <option value="other">Add a New Centre</option>
            </select>
          </div>

          {showNewCentreInput && !centreAdded && (
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Enter New Centre Name"
                value={newCentreName}
                onChange={(e) => setNewCentreName(e.target.value)}
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleAddCentre}
                className={`${styles.actionButton} ${styles.downloadButton}`}
                disabled={!newCentreName.trim()}
              >
                Add Centre
              </button>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Exam Name:</label>
            <input
              type="text"
              name="examName"
              placeholder="Exam Name"
              value={formData.examName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Exam Date:</label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>District:</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {blocks.length > 0 && (
            <div className={styles.formGroup}>
              <label>Select Block(s):</label>
              <div className={styles.checkboxGroup}>
                {blocks.map((block) => {
                  const isUsed = usedBlocks.includes(Number(block.id));
                  return (
                    <div key={block.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={formData.blocks.includes(block.id)}
                        onChange={() => handleBlockCheckboxChange(block.id)}
                        disabled={isUsed}
                        className={styles.checkbox}
                      />
                      <span>{block.name}</span>
                      {isUsed && (
                        <span className={styles.disabledText}>
                          (Already in use)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.actionButton} ${styles.downloadButton}`}
          >
            Create Exam
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateExam;
