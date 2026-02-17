import React, { useState } from "react";
import { type Report } from "./lib/types";
import toast, { Toaster } from "react-hot-toast";
import getAnalysis from "./actions/Analysis";

const App = () => {
  const [File, setFile] = useState<File | null>(null);
  const [Uploded, setUploaded] = useState<boolean>(false);
  const [report, setReport] = useState<Report>(null);

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
    setUploaded(true);
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
    try {
      const res = (await getAnalysis(formdata)) as Report;
      setReport(res);
      toast.success("Your report is ready", { id: toastid });
    } catch (err) {
      if (err instanceof Error) toast.error(err.message, { id: toastid });
      else toast.error(String(err), { id: toastid });
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
      <div className="w-screen h-screen text-white bg-black/90 flex flex-col items-center p-4">
        <h1 className="md:text-3xl text-xl italic font-mono text-cyan-500">
          Social Media Content Analyzer
        </h1>
        <form
          className="mt-10 flex flex-col items-center gap-6"
          onSubmit={handleSubmit}
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="md:w-[400px] md:h-[250px] w-[300px] h-[200px] bg-white/90 rounded-md flex justify-center items-center cursor-pointer hover:bg-white transition-colors"
          >
            <label
              htmlFor="File"
              className="w-full h-full flex flex-col justify-center cursor-pointer"
            >
              {Uploded ? (
                <p className="text-green-700 text-center text-xl font-semibold">
                  {File?.name} Uploaded
                </p>
              ) : (
                <div className="text-center text-black">
                  <p className="text-amber-800 text-xl">
                    Select Image/PDF for Analysis
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    or drag and drop here
                  </p>
                </div>
              )}
              <input id="File" onChange={handlefilechange} type="file" hidden />
            </label>
          </div>
          <button
            type="submit"
            className="bg-cyan-700 hover:bg-cyan-800 p-3 text-lg rounded-md transition-colors cursor-pointer"
          >
            Analyze Content
          </button>
        </form>
        {/* RENDERING THE REPOR */}
        {report && (
          <div className="mt-10 p-6 bg-white/10 rounded-lg w-full max-w-2xl border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">
                Analysis Report
              </h2>
              <span className="text-4xl font-mono text-cyan-500">
                {report.engagement_score}%
              </span>
            </div>
            <p className="mb-2">
              <strong>Tone:</strong> {report.tone}
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Best for: {report.platform_fit}
            </p>

            <div className="flex gap-2 mb-4">
              {report.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-cyan-900 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <ul className="list-disc ml-5 space-y-2">
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
