import axios from "axios";

const axiosIntance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "https://social-media-content-analyzer-o26b.onrender.com/api",
    withCredentials : true
});

export default axiosIntance;