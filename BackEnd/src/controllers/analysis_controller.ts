import { type Request, type Response } from "express";
import fs from "fs";
import { pdfToPng } from "pdf-to-png-converter";
import { createWorker } from "tesseract.js";
import fetchGeminiResponse from "../lib/gemini.js";
import path from "path";
import sharp from "sharp";

export const getAnalysis = async (req: Request, res: Response) => {
    let filePath = "";
    let convertedPath = "";
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    const pngPaths: string[] = [];

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        filePath = req.file.path;
        let extractedText = "";
        worker = await createWorker("eng");

        if (req.file.mimetype === "application/pdf") {
            const outputFolder = path.dirname(filePath);
            const outputFileMask = path.basename(filePath, path.extname(filePath));

            const pngPages = await pdfToPng(filePath, {
                viewportScale: 2.0,
                outputFolder,
                outputFileMaskFunc: () => outputFileMask,
            });

            for (const page of pngPages) {
                const pagePath = page.path;
                if (!pagePath || !fs.existsSync(pagePath)) {
                    console.warn(`Skipping page ${page.pageNumber}: not found at "${pagePath}"`);
                    continue;
                }
                pngPaths.push(pagePath);
                const { data } = await worker.recognize(pagePath);
                extractedText += data.text + "\n";
            }

        } else {
            // Convert ANY image format to PNG before OCR
            // This handles AVIF, WebP, HEIC, and anything else sharp supports
            convertedPath = filePath + ".converted.png";
            await sharp(filePath).png().toFile(convertedPath);

            const { data } = await worker.recognize(convertedPath);
            extractedText = data.text;
        }

        if (!extractedText.trim()) {
            return res.status(422).json({ error: "No text could be extracted from the file." });
        }

        const analysisData = {
            content: extractedText,
            line_count: extractedText.split("\n").filter((l) => l.trim()).length,
            language: "English",
        };

        const result = await fetchGeminiResponse(analysisData);
        return res.status(200).json(result);

    } catch (err: any) {
        const message = err.responseBody?.error.message || err.message || "An error occurred during analysis.";
        console.log(message);
        return res.status(500).json({ message });

    } finally {
        if (worker) await worker.terminate();


        if (convertedPath && fs.existsSync(convertedPath)) {
            fs.unlinkSync(convertedPath);
        }
        for (const p of pngPaths) {
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }

        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};