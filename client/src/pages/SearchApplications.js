import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFetchStates, useFetchDistricts, useFetchBlocks, useFetchInstitutes } from "../hooks/useJurisData";
import classes from "./SearchApplications.module.css"; // Assuming you have CSS Modules

const SearchApplications = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const startYear = 2022; // Or your desired start year
  const yearOptions = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  const mediumOptions = ["ENGLISH", "KANNADA", "URDU", "MARATHI"]; 
  
  const initialFormData = {
    nmms_year: currentYear,
    app_state: "",
    district: "",
    nmms_block: "",
    medium: "",
    current_institute_dise_code: "",
    nmms_reg_number: "",
    student_name: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [institutes, setInstitutes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const isRegNumberEntered = formData.nmms_reg_number.trim().length > 0;

  //Fetching data using custom hooks
  useFetchStates(setStates);
  useFetchDistricts(formData.app_state, setDistricts);
  useFetchBlocks(formData.district, setBlocks);
  useFetchInstitutes(formData.nmms_block, setInstitutes);

  // Clear other fields when registration number is entered/cleared
  useEffect(() => {
    if (isRegNumberEntered) {
      setFormData(prev => ({
        ...initialFormData, // Reset most fields
        nmms_year: prev.nmms_year, // Keep year
        nmms_reg_number: prev.nmms_reg_number // Keep reg number
      }));
      setDistricts([]);
      setBlocks([]);
      setInstitutes([]);
      setErrors({}); // Clear errors
    }
  }, [isRegNumberEntered]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // Clear specific errors when user starts typing/selecting
    if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Basic Validation Example
    if (formData.nmms_reg_number && formData.nmms_reg_number.trim().length !== 11) {
      newErrors.nmms_reg_number = "Registration number must be 11 digits";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Filter out empty fields before sending to backend
    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    );

    const searchParams = {
        ...filteredFormData,
        limit: 10, // Or your desired page size
        offset: 0   // Start at the first page
    };

    try {
      // Make the API call to your backend search endpoint
      const response = await axios.get("http://localhost:5000/api/search", {
        params: searchParams, // Send filters and pagination params
      });

      // --- Backend now returns an object { data: [], pagination: {} } ---
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        alert("No applications found matching your criteria."); // Inform user
        return;
      }

      // Navigate to ViewApplications page with the first page results and pagination info
      navigate("/view-applications", {
        state: {
            initialApplications: response.data.data, // Pass the first page of applications
            paginationInfo: response.data.pagination, // Pass total count, limit etc.
            searchFilters: filteredFormData // Pass the filters used (without limit/offset)
        }
      });

    } catch (error) {
      console.error("Error searching applications:", error);
      if (error.response && error.response.status === 404) {
          alert("No applications found matching your criteria.");
      } else {
          alert("Error searching applications. Please check the console and try again.");
      }
    }
  };

  return (
    <div className={classes.container}>
      <h1>Search Applications</h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        <div className={classes.formGroup}>
          <label htmlFor="nmms_year">Year:</label>
          <select name="nmms_year" value={formData.nmms_year} onChange={handleChange} disabled={isRegNumberEntered}>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className={classes.formGroup}>
          <label htmlFor="nmms_reg_number">NMMS Registration Number:</label>
          <input
            type="text"
            name="nmms_reg_number"
            placeholder="Enter 11-digit number"
            value={formData.nmms_reg_number}
            onChange={handleChange}
            maxLength="11"
          />
          {errors.nmms_reg_number && <span className={classes.error}>{errors.nmms_reg_number}</span>}
        </div>

        <p className={classes.orSeparator}>OR search by other criteria (leave Reg Number blank):</p>

        <div className={classes.formGroup}>
          <label htmlFor="app_state">State:</label>
          <select name="app_state" value={formData.app_state} onChange={handleChange} disabled={isRegNumberEntered}>
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option> // Adjust key/value based on your API response
            ))}
          </select>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="district">District:</label>
          <select name="district" value={formData.district} onChange={handleChange} disabled={isRegNumberEntered || !formData.app_state}>
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>{district.name}</option> // Adjust key/value
            ))}
          </select>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="nmms_block">Block:</label>
          <select name="nmms_block" value={formData.nmms_block} onChange={handleChange} disabled={isRegNumberEntered || !formData.district}>
            <option value="">Select Block</option>
            {blocks.map(block => (
              <option key={block.id} value={block.id}>{block.name}</option> // Adjust key/value
            ))}
          </select>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="current_institute_dise_code">Institute:</label>
          <select name="current_institute_dise_code" value={formData.current_institute_dise_code} onChange={handleChange} disabled={isRegNumberEntered || !formData.nmms_block}>
            <option value="">Select Institute</option>
            {institutes.map(institute => (
              // Use dise_code as value, but display institute_name
              <option key={institute.institute_id} value={institute.dise_code}>{institute.institute_name}</option>
            ))}
          </select>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="medium">Medium:</label>
          <select name="medium" value={formData.medium} onChange={handleChange} disabled={isRegNumberEntered}>
            <option value="">Select Medium</option>
            {mediumOptions.map(medium => (
              <option key={medium} value={medium}>{medium}</option>
            ))}
          </select>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="student_name">Student Name:</label>
          <input
            type="text"
            name="student_name"
            placeholder="Enter student name (partial match)"
            value={formData.student_name}
            onChange={handleChange}
            disabled={isRegNumberEntered}
            maxLength="50"
          />
        </div>

        {/* --- REMOVED disabled PROP --- */}
        <button type="submit" className={classes.submitButton}>Search</button>
        {/* --- END REMOVAL --- */}
      </form>

       {/* Optional: Display general errors */}
       {Object.keys(errors).length > 0 && !errors.nmms_reg_number && (
         <div className={classes.errorSummary}>
           Please correct the errors above.
         </div>
       )}
    </div>
  );
};

export default SearchApplications;