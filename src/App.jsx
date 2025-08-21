import React, { useState, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://invoicebackend.up.railway.app";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    handleDragEvents(e);
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setDragOver(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleClick = () => {
    document.getElementById("file-input").click();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await axios.post(`${API_BASE}/api/convert`, form, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.endsWith(".pdf")
        ? "converted.xlsx"
        : "converted.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFile(null); // Reset after successful download
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "An unknown error occurred during conversion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="converter-box">
        <h1 className="title">Bank Statement Analyzer</h1>
        <p className="subtitle">
          Upload a PDF bank statement to convert it into a structured Excel
          file.
        </p>

        <form onSubmit={onSubmit}>
          <div
            className={`upload-area ${dragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {file ? (
              <p className="file-name">{file.name}</p>
            ) : (
              <p>
                <strong>Drag & drop a file here</strong>
                <br />
                or click to select a file
              </p>
            )}
          </div>

          <button disabled={loading || !file} type="submit" className="btn">
            {loading ? "Analyzing..." : "Convert & Download"}
          </button>
        </form>

        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}