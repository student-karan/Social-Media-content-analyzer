import axiosIntance from "../lib/axios";

export default async function getAnalysis(formdata: FormData) {
    try {
        const res = await axiosIntance.post("/analysis", formdata, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data;
    } catch (err) {
        let errorMsg = "";
        if (err instanceof Error) errorMsg = err.message;
        else errorMsg = "An unexpected error occured";
        throw new Error(errorMsg);
    }
}