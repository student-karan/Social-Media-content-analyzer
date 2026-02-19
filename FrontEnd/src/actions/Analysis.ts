import { AxiosError } from "axios";
import axiosIntance from "../lib/axios";

export default async function getAnalysis(formdata: FormData) {
    try {
        const res = await axiosIntance.post("/analysis", formdata, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data;
    } catch (err) {
        const errorMsg = err instanceof AxiosError ? err.response?.data.error.slice(0,76) : "An unknown error occurred.";
        throw new Error(errorMsg);
    }
}