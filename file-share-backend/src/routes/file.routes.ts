import * as express from 'express'
import {FileService} from "../services";
import * as stream from "stream";

const router = express.Router()

router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        res.send({
            status: 'success',
            data: await FileService.readFileList()
        })
    } catch (e) {
        console.error(e)
        res.status(500).send({
            status: 'error',
            message: 'internal server error'
        })
    }
});

router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const file = await FileService.downloadFile(req.params.id)
        if (file == null) {
            return res.status(400).send({
                status: 'error',
                message: 'file not found'
            })
        }
        const readStream = new stream.PassThrough();
        readStream.end(file.data);
        res.set('Content-disposition', 'attachment; filename=' + file.fileName);
        res.set('Content-Type', 'text/plain');
        readStream.pipe(res);
    } catch (e) {
        console.error(e)
        res.status(500).send({
            status: 'error',
            message: 'internal server error'
        })
    }
});

router.post('/', async (req: express.Request & { files: { file: any } }, res: express.Response) => {
    if (req.files.file == null) {
        res.status(400).send({
            status: 'error',
            message: 'file not found'
        })
    }
    try {
        const {id} = await FileService.uploadFile(req.files.file)
        res.send({
            status: 'success',
            data: {
                id: id
            }
        })
    } catch (e) {
        console.error(e)
        res.status(500).send({
            status: 'error',
            message: 'internal server error'
        })
    }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        await FileService.deleteFile(req.params.id)
        res.send({
            status: 'success',
        })
    } catch (e) {
        console.error(e)
        res.status(500).send({
            status: 'error',
            message: 'internal server error'
        })
    }
});

export default router;
