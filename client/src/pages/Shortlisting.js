import React from "react";
import { Link } from "react-router-dom";
import "./Shortlisting.css";

const Shortlisting = () => {
  return (
    <div className="container mt-4">
      <h2 className="text-center">Shortlisting</h2>

      <div className="shortlisting-steps mt-4">
       
        <div className="option-box">
          <Link to="/generate-shortlist" className="option-link">
            <div className="icon-box">
              <i className="fas fa-upload"></i>
            </div>
            <div className="text-box">Generate Shortlist</div>
          </Link>
        </div>

        
        <div className="option-box">
          <Link to="/shortlist-info" className="option-link">
            <div className="icon-box">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="text-box">Shortlisted Information</div>
          </Link>
        </div>
      </div>

      <div className="shortlist-container mt-4">
        <h1>Shortlisting Process</h1>
        <h3>Instructions</h3>
        <ul>
        <li>
            The first step is to generate a shortlist based on the state,
<<<<<<< HEAD
<<<<<<< HEAD
            district, and optionally multiple blocks.
          </li>
          <li>
            You can generate a shortlist multiple times. However, if you want to
            finalize and lock the shortlist, you need to freeze it from the
            "Shortlisted Information" interface.
=======
            district, and multiple blocks, using specific criteria.
=======
            district, and optionally multiple blocks, using specific criteria.
>>>>>>> parent of e7a48c1 (first commit)
          </li>
          <li>
            You can generate a shortlist multiple times.
            Only one shortlist can exist for a specific block at any given time.
            To finalize and secure a shortlist, you need to freeze it from the
            "Shortlisted Information" interface.
            Similarly, deletion of a shortlist is also done through the "Shortlisted Information" interface.
>>>>>>> e7a48c159d4ace8483cebe22797c96a735dc6ac7
          </li>
          <li>
            From the "Shortlisted Information" interface, you can access all the
            details of the shortlists.
          </li>
          <li>
            You also have the options to delete the shortlist by name and
            download the list of shortlisted students.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Shortlisting;
