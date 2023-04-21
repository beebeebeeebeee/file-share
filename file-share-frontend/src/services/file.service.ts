import axios from "axios";
import {FileType, GenericResponse} from "../types";

const endpoint = `http://${window.location.host.split(':')[0]}:9091/api/file`
const api = axios.create({
    baseURL: endpoint
})

async function readFileList(): Promise<GenericResponse<Array<FileType>>> {
    const {data} = await api.get<GenericResponse<Array<FileType>>>('/')
    return data
}

function downloadFile(id: string): string {
    return `${endpoint}/${id}`
}

async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, encodeURIComponent(file.name))
    await api.post('/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

async function deleteFile(id: string) {
    await api.delete(`/${id}`)
}

export default {
    readFileList,
    downloadFile,
    uploadFile,
    deleteFile,
}