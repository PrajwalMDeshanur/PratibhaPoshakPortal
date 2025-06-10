import { useState, useEffect } from "react";
import axios from "axios";

const useCreateExamHooks = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [assignedApplicants, setAssignedApplicants] = useState([]);
  const [centres, setCentres] = useState([]);
  const [newCentreName, setNewCentreName] = useState("");
  const [createdExamId, setCreatedExamId] = useState(null);
  const [examBlocks, setExamBlocks] = useState({});
  
  // Add this new effect to fetch blocks for each entry
  useEffect(() => {
    const fetchBlocksForEntries = async () => {
      const blocksData = {};
      
      for (const entry of entries) {
        if (entry.district) {
          try {
            const response = await axios.get(`http://localhost:5000/api/exams/blocks-by-district/${entry.district}`);
            blocksData[entry.district] = response.data;
          } catch (error) {
            console.error(`Error fetching blocks for district ${entry.district}:`, error);
          }
        }
      }
      
      setExamBlocks(blocksData);
    };
    
    if (entries.length > 0) {
      fetchBlocksForEntries();
    }
  }, [entries]);
  
  const [formData, setFormData] = useState({
    centreId: "",
    examName: "",
    examDate: "",
    district: "",
    blocks: [],
    app_state: 1,
  });

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/exams/exam-centres");
        setCentres(response.data);
      } catch (error) {
        console.error("Error fetching centres:", error);
      }
    };
    fetchCentres();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("examEntries");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!formData.app_state) return;
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/districts-by-state/${formData.app_state}`);
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [formData.app_state]);

  useEffect(() => {
    if (!formData.district) return;
    const fetchBlocks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/blocks-by-district/${formData.district}`);
        setBlocks(response.data);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };
    fetchBlocks();
  }, [formData.district]);

  // Add this new state to track used blocks
  const [usedBlocks, setUsedBlocks] = useState([]);
  
  // Add this effect to fetch blocks that are already used in exams
  useEffect(() => {
    const fetchUsedBlocks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/exams/used-blocks");
        setUsedBlocks(response.data);
      } catch (error) {
        console.error("Error fetching used blocks:", error);
      }
    };
    fetchUsedBlocks();
  }, [entries]); // Re-fetch when entries change
  
const checkBlockUsage = async (blockId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/exams/used-blocks?blockId=${blockId}`);
    return response.data.length > 0;
  } catch (error) {
    console.error("Error checking block usage:", error);
    return false;
  }
};

const handleBlockCheckboxChange = async (blockId) => {
  const isUsed = await checkBlockUsage(blockId);
  
  if (isUsed) {
    setMessage(`❌ Block ${blockId} is already used in another exam. Delete that exam first.`);
    return;
  }
  
  setFormData((prev) => {
    const newBlocks = prev.blocks.includes(blockId)
      ? prev.blocks.filter((id) => id !== blockId)
      : [...prev.blocks, blockId];
    return { ...prev, blocks: newBlocks };
  });
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setAssignedApplicants([]);
    setCreatedExamId(null);

    try {
      const payload = {
        centreId: formData.centreId,
        Exam_name: formData.examName,
        date: formData.examDate,
        district: formData.district,
        blocks: formData.blocks,
      };

      const response = await axios.post("http://localhost:5000/api/exams/create", payload);
      const newEntry = {
        ...formData,
        examId: response.data.examId,
      };

      setEntries((prev) => {
        const updated = [...prev, newEntry];
        localStorage.setItem("examEntries", JSON.stringify(updated));
        return updated;
      });

      setAssignedApplicants(response.data.applicants || []);
      setCreatedExamId(response.data.examId);
      setFormData({
        centreId: "",
        examName: "",
        examDate: "",
        district: "",
        blocks: [],
        app_state: formData.app_state, // preserve current state selection
      });
      setShowForm(false);
      setMessage("✅ Exam Created and Students Assigned Successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Provide more specific error messages
      if (error.response) {
        if (error.response.status === 400) {
          setMessage(`❌ ${error.response.data.error || "Missing required fields"}`); 
        } else if (error.response.status === 404) {
          setMessage(`❌ ${error.response.data.message || "No applicants found for selected blocks"}`); 
        } else if (error.response.status === 409) {
          setMessage(`❌ ${error.response.data.message || "Conflict with existing data"}`); 
        } else {
          setMessage(`❌ Server error: ${error.response.data.message || "Unknown error"}`); 
        }
      } else if (error.request) {
        setMessage("❌ No response from server. Check your connection.");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createCentre = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/exams/exam-centres", {
        pp_exam_centre_name: newCentreName,
      });
      setCentres([...centres, res.data]);
      setNewCentreName("");
      setMessage("✅ Centre created successfully");
    } catch (err) {
      console.error("Create centre error:", err);
      setMessage("❌ Failed to create centre");
    }
  };

  const deleteCentre = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/exams/exam-centres/${id}`);
      setCentres(centres.filter((c) => c.pp_exam_centre_id !== id));
      if (formData.centreId === id) {
        setFormData({ ...formData, centreId: "" });
      }
      setMessage("✅ Centre deleted");
    } catch (err) {
      console.error("Delete centre error:", err);
      setMessage("❌ Failed to delete centre");
    }
  };

  const deleteExam = async (examId) => {
    try {
      await axios.delete(`http://localhost:5000/api/exams/${examId}`);
      setEntries((prev) => {
        const updated = prev.filter((e) => e.examId !== examId);
        localStorage.setItem("examEntries", JSON.stringify(updated));
        return updated;
      });
      setMessage("✅ Exam deleted successfully");
    } catch (err) {
      console.error("Failed to delete exam:", err);
      setMessage("❌ Failed to delete exam");
    }
  };

  // Add this function before the return statement
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  return {
    entries,
    setEntries,
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
    handleChange,  // Now this function exists
    handleBlockCheckboxChange,
    handleSubmit,
    createCentre,
    deleteCentre,
    deleteExam,
    createdExamId,
    setCreatedExamId,
    examBlocks,
    usedBlocks,
  };
};

export default useCreateExamHooks;
