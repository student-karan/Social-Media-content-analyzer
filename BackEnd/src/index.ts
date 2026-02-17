import express from "express";
import cors from "cors";
import "dotenv/config";
import { upload } from "./middleware/multer.js";
import { getAnalysis } from "./controllers/analysis_controller.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = ["http://localhost:5173", "https://social-media-content-analyzer-eta-six.vercel.app"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.post("/api/analysis", upload.single('file'), getAnalysis);

app.listen(port, () => {
    console.log("the server is listening for request at port number", port);
})