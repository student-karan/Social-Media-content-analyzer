import React, { useState } from "react";
import { type Report } from "./lib/types";
import toast, { Toaster } from "react-hot-toast";
import getAnalysis from "./actions/Analysis";

const App = () => {
  const [File, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report>(null);
  const [loading, setLoading] = useState<boolean>(false);

  function handlefilechange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files?.[0];
    if (
      !file ||
      (!file.type.startsWith("image/") &&
        !file.type.startsWith("application/pdf"))
    ) {
      toast.error("Only pdf and image files are allowed!");
      return;
    }
    const maxSizeMB = 10;
    const maxSizeKB = 1024 * maxSizeMB;
    if (file.size / 1024 > maxSizeKB) {
      toast.error("Image selected exceed the size limit of 10MB.");
      return;
    }
    setFile(file);
    toast.success("File Uploaded");
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!File) {
      toast.error("You must upload a PDF/Image file before Submitting.");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", File);
    const toastid = toast.loading("Please wait, your file is being analyzed.");
    setLoading(true);
    try {
      const res = (await getAnalysis(formdata)) as Report;
      setReport(res);
      toast.success("Your report is ready", { id: toastid });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, { id: toastid });
      } else {
        toast.error("An unknown error occurred.", { id: toastid });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handlefilechange({
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  }
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="app-container">
        <h1 className="app-title">
          Social Media Content Analyzer
        </h1>
        <form
          className="analysis-form"
          onSubmit={handleSubmit}
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="dropzone"
          >
            <label
              htmlFor="File"
              className="dropzone-label"
            >
              {File !== null ? (
                <p className="file-uploaded-status">
                  {File?.name} Uploaded
                </p>
              ) : (
                <div className="upload-prompt">
                  <p className="upload-prompt-title">
                    Select Image/PDF for Analysis
                  </p>
                  <p className="upload-prompt-subtitle">
                    or drag and drop here
                  </p>
                </div>
              )}
              <input id="File" onChange={handlefilechange} type="file" hidden />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="analyze-button"
          >
            Analyze Content
          </button>
        </form>
        {/* RENDERING THE REPOR */}
        {report && (
          <div className="report-card">
            <div className="report-header">
              <h2 className="report-title">
                Analysis Report
              </h2>
              <span className="engagement-score">
                {report.engagement_score}%
              </span>
            </div>
            <p className="report-tone">
              <strong>Tone:</strong> {report.tone}
            </p>
            <p className="report-platform">
              Best for: {report.platform_fit}
            </p>

            <div className="tags-container">
              {report.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <ul className="suggestions-list">
              {report.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
