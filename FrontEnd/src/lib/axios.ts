import axios from "axios";

const axiosIntance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "",
    withCredentials : true
});

export default axiosIntance;