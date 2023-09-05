import axios from "axios";


const instance = axios.create({
    baseURL: "https://api2-mtc.gazzetta.it/api/v1",
});


export default instance