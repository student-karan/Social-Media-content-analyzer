import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import "dotenv/config";
import { upload } from "./middleware/multer.js";
import { getAnalysis } from "./controllers/analysis_controller.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT;
const allowedOrigins = ["http://localhost:5173","https://social-media-content-analyzer-eta-six.vercel.app"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.post("/api/analysis", upload.single('file'), getAnalysis);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../FrontEnd/dist")));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../FrontEnd/dist/index.html"));
    });
}

app.listen(port, () => {
    console.log("the server is listening for request at port number", port);
})