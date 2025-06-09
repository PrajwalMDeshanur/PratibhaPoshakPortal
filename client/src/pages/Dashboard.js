import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import "./Dashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_ENDPOINT = "http://localhost:5000/api/shortlists";

const animateCount = (start, end, setState, ref) => {
  let current = start;
  const duration = 1500;
  const increment = Math.ceil((end - start) / (duration / 16));

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      clearInterval(timer);
      setState(end);
    } else {
      setState(current);
    }
  }, 16);
  ref.current = end;
};

const Dashboard = () => {
  const [applicantCount, setApplicantCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const applicantCountRef = useRef(0);
  const shortlistedCountRef = useRef(0);

  const [blockData, setBlockData] = useState([]); // Top 5 Blocks
  const [shortlistedBlockData, setShortlistedBlockData] = useState([]); // Top 5 Shortlisted Blocks

  useEffect(() => {
    // Fetch applicant and shortlisted counts
    fetch(`${API_ENDPOINT}/counts`)
      .then((response) => response.json())
      .then((data) => {
        animateCount(
          0,
          data.totalApplicants,
          setApplicantCount,
          applicantCountRef
        );
        animateCount(
          0,
          data.totalShortlisted,
          setShortlistedCount,
          shortlistedCountRef
        );
      })
      .catch((error) =>
        console.error("Error fetching applicant counts:", error)
      );

    // Fetch top 5 blocks from backend
    fetch("http://localhost:5000/api/top-blocks")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item) => ({
          block_name: item.juris_name,
          count: Number(item.count),
        }));
        setBlockData(formattedData);
      })
      .catch((err) => console.error("Failed to fetch top blocks:", err));

    // Fetch top 5 shortlisted blocks from backend
    fetch("http://localhost:5000/api/shortlist-top-blocks")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item) => ({
          block_name: item.juris_name,
          count: Number(item.count),
        }));
        setShortlistedBlockData(formattedData);
      })
      .catch((err) =>
        console.error("Failed to fetch shortlisted blocks:", err)
      );
  }, []);

  const blockChartData = {
    labels: blockData.map((item) => item.block_name),
    datasets: [
      {
        label: "Applicants per Block",
        data: blockData.map((item) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const shortlistedChartData = {
    labels: shortlistedBlockData.map((item) => item.block_name),
    datasets: [
      {
        label: "Shortlisted Applicants per Block",
        data: shortlistedBlockData.map((item) => item.count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        font: { size: 16 },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="summary-counts">
        <div className="summary-box">
          <strong>Total Applicants</strong>
          <span className="count">{applicantCount}</span>
        </div>
        <div className="summary-box">
          <strong>Total Shortlisted</strong>
          <span className="count">{shortlistedCount}</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-section">
          <Bar
            data={blockChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: "Top 5 Blocks by Number of Applicants",
                },
              },
            }}
          />
        </div>

        <div className="chart-section">
          <Bar
            data={shortlistedChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: "Top 5 Blocks by Number of Shortlisted Applicants",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
