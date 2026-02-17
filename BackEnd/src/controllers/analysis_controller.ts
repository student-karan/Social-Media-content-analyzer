import { type Request, type Response } from "express";
import fs from "fs";
import { pdfToPng } from "pdf-to-png-converter";
import Tesseract from "tesseract.js";
import fetchGeminiResponse from "../lib/gemini.js";
import { fileURLToPath } from "url";
import path from "path";

export const getAnalysis = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        let extractedText = "";
        const filePath = req.file.path;

        if (req.file.mimetype === "application/pdf") {
            // Convert PDF pages to PNG Buffers using the pure-JS converter
            const pngPages = await pdfToPng(filePath, {
                viewportScale: 2.0,
                outputFolder : path.dirname(filePath)
            });
            // OCR for each page
            for (const page of pngPages) {
                const { data } = await Tesseract.recognize(page.path);
                extractedText += data.text + "\n";
                fs.unlinkSync(page.path);
            }
        } else {
            const { data } = await Tesseract.recognize(filePath);
            extractedText = data.text;
        }

        const analysisData = {
            content: extractedText,
            line_count: extractedText.split("\n").filter((l) => l.trim()).length,
            language: "English",
        };
        // get analysis from google gemini
        const result = await fetchGeminiResponse(analysisData);

        // Clean up the file after processing
        fs.unlinkSync(filePath);

        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "Analysis failed" });
    }
};
