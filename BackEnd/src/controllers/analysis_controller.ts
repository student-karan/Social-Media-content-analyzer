import { type Request, type Response } from "express";
import fs from "fs/promises";
import { existsSync } from "fs";
import { pdfToPng } from "pdf-to-png-converter";
import { createWorker } from "tesseract.js";
import { PDFParse } from "pdf-parse";
import fetchGeminiResponse from "../lib/gemini.js";
import path from "path";
import sharp from "sharp";

export const getAnalysis = async (req: Request, res: Response) => {
    let filePath = "";
    let convertedPath = "";
    let worker: any = null;
    const pngPaths: string[] = [];

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        filePath = req.file.path;
        let extractedText = "";

        // 1. PDF Parsing Logic
        if (req.file.mimetype === "application/pdf") {
            const parser = new PDFParse({ url: filePath });
            const result = await parser.getText();

            if (result.text && result.text.trim().length > 20) {
                extractedText = result.text;
            } else {
                // 2. OCR Fallback for Scanned PDFs
                const outputFolder = path.dirname(filePath);
                const outputFileMask = path.basename(filePath, path.extname(filePath));

                const pngPages = await pdfToPng(filePath, {
                    viewportScale: 2.0,
                    outputFolder,
                    outputFileMaskFunc: (pagenum) => outputFileMask+"page_"+pagenum,
                });

                worker = await createWorker("eng");
                for (const page of pngPages) {
                    const pagePath = page.path;
                    pngPaths.push(pagePath);
                    const { data } = await worker.recognize(pagePath);
                    extractedText += data.text + "\n";
                }
            }
        }
        // 3. Image OCR Logic
        else {
            // Convert to PNG for consistent OCR results across different formats (AVIF, WebP, etc.)
            convertedPath = filePath + ".converted.png";
            await sharp(filePath).png().toFile(convertedPath);

            worker = await createWorker("eng");
            const { data } = await worker.recognize(convertedPath);
            extractedText = data.text;
        }

        if (!extractedText.trim()) {
            return res.status(422).json({ error: "No text could be extracted from the file." });
        }

        // 4. Analysis
        const analysisData = {
            content: extractedText,
            line_count: extractedText.split("\n").filter((l) => l.trim()).length,
            language: "English",
        };

        const result = await fetchGeminiResponse(analysisData);
        return res.status(200).json(result);

    } catch (err: any) {
        const actualError = err?.lastError ?? err;
        const status = actualError?.statusCode ?? 500;

        let message = actualError?.message || "Analysis failed";
        if (actualError?.responseBody) {
            const parsed = JSON.parse(actualError.responseBody);
            message = parsed?.error?.message ?? message;
        }
        console.log(message);
        return res.status(status).json({ error: message });
    } finally {
        // 5. Cleanup
        if (worker) await worker.terminate();

        const filesToDelete = [filePath, convertedPath, ...pngPaths];
        for (const f of filesToDelete) {
            if (f && existsSync(f)) {
                await fs.unlink(f).catch(() => { });
            }
        }
    }
};