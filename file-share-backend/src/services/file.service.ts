import * as fs from "fs";
import * as path from "path";
import {PrismaClient, FileEntity} from '@prisma/client'

const prisma = new PrismaClient()

async function readFileList(): Promise<FileEntity[]> {
    return prisma.fileEntity.findMany();
}

async function downloadFile(id: string): Promise<null | { fileName: string, data: Buffer }> {
    const entity = await prisma.fileEntity.findFirst({where: {id}})
    if (entity == null) {
        return null
    }
    const data = await _readFile(id)
    entity.download++;
    await prisma.fileEntity.update({
        where: {
            id: id,
        },
        data: entity
    });
    return {
        fileName: entity.fileName,
        data: data,
    }
}

async function uploadFile(file: any): Promise<{ id: string }> {
    const id = await _generateId()
    const entity: FileEntity = {
        id: id,
        fileName: decodeURIComponent(file.name),
        download: 0,
        size: file.size,
    }
    await _writeFile(id, file.data)
    await prisma.fileEntity.create({data: entity})
    return {id}
}

async function deleteFile(id: string) {
    await prisma.fileEntity.delete({where: {id}})
    await _deleteFile(id)
}

async function _generateId(): Promise<string> {
    while (true) {
        const id: string = Math.random().toString(36).slice(2, 7).toUpperCase()
        if ((await prisma.fileEntity.findFirst({where: {id}})) == null) {
            return id
        }
    }
}

async function _readFile(id: string): Promise<Buffer> {
    return fs.readFileSync(path.join('upload/', id))
}

async function _writeFile(id: string, file: Buffer): Promise<void> {
    await fs.writeFileSync(path.join('upload/', id), file)
}

async function _deleteFile(id: string): Promise<void> {
    await fs.rmSync(path.join('upload/', id))
}

export default {
    readFileList,
    downloadFile,
    uploadFile,
    deleteFile,
}