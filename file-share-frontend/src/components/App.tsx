import {useCallback, useEffect, useRef, useState} from 'react'
import {FileService} from "../services";
import {FileType} from "../types";
import {
    AppBar, Box,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    Stack,
    styled,
    Toolbar,
    Typography
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import {LoadingButton} from "@mui/lab";
import Dropzone from "react-dropzone";
import QRCode from 'react-qr-code';
import {NumberUtil} from "../utils";

const CardContentPadding = styled(CardContent)(`
  padding: 0.75rem;
  &:last-child {
    padding-bottom: 0.75rem;
  }
`);

export function App() {

    const [files, setFiles] = useState<Array<FileType>>()
    const [toggleUploadDialog, setToggleUploadDialog] = useState<boolean>(false)
    const [toggleQrDialog, setToggleQrDialog] = useState<boolean>(false)
    const [qrDialogUrl, setQrDialogUrl] = useState<string>()

    const readFileList = useCallback(async () => {
        const {data} = await FileService.readFileList()
        setFiles(data)
    }, [])

    const downloadFile = useCallback((id: string): string => {
        return FileService.downloadFile(id)
    }, [])

    const deleteFile = useCallback(async (id: string) => {
        await FileService.deleteFile(id)
        await readFileList()
    }, [])

    const showQr = useCallback(async (id: string) => {
        setQrDialogUrl(downloadFile(id))
        setToggleQrDialog(true)
    }, [])

    useEffect(() => {
        void readFileList()
    }, [])

    return (
        <>
            <AppBar>
                <Toolbar>
                    File Uploader @fung.mak
                </Toolbar>
            </AppBar>
            <_UploadFileDialog
                show={toggleUploadDialog}
                onClose={() => setToggleUploadDialog(false)}
                onDone={() => {
                    setToggleUploadDialog(false)
                    void readFileList()
                }}
            />
            <_QrDialog
                show={toggleQrDialog}
                onClose={() => {
                    setToggleQrDialog(false)
                }}
                url={qrDialogUrl}
            />
            <Toolbar/>
            <Container sx={{pt: 2}}>
                <Stack spacing={1}>
                    {
                        files?.map(({id, fileName, download, size}) => {
                            return <Stack direction='row' spacing={2} alignItems='center' key={id}>
                                <Card sx={{width: '100%'}}>
                                    <CardContentPadding>
                                        <Stack
                                            direction='row'
                                            justifyContent='space-between'
                                            alignItems='center'
                                        >
                                            <Stack>
                                                <a href={downloadFile(id)} onClick={() => {
                                                    setTimeout(() => {
                                                        void readFileList()
                                                    }, 100)
                                                }}>
                                                    <Typography variant='h6' sx={{color: '#000000'}}>
                                                        {id} <span style={{fontSize: '1rem', color: '#adadad'}}>{NumberUtil.sizeFormat(size)}</span>
                                                    </Typography>
                                                    <Typography sx={{color: '#7c7c7c'}}>
                                                        {fileName}
                                                    </Typography>
                                                </a>
                                            </Stack>

                                        </Stack>
                                    </CardContentPadding>
                                </Card>
                                <Stack
                                    direction='row'
                                    alignItems='center'
                                    spacing={1}
                                >
                                    <Typography sx={{color: '#4e74be', minWidth: "30px", textAlign: 'center'}}>
                                        {download}
                                    </Typography>
                                    <IconButton
                                        sx={{height: "40px", width: "40px"}}
                                        onClick={() => showQr(id)}
                                    >
                                        <QrCode2Icon/>
                                    </IconButton>
                                    <IconButton
                                        sx={{height: "40px", width: "40px"}}
                                        onClick={() => deleteFile(id)}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Stack>
                            </Stack>
                        })
                    }
                </Stack>
            </Container>
            <Fab
                color="primary"
                sx={{
                    position: 'absolute',
                    right: '2rem',
                    bottom: '2rem'
                }}
                onClick={() =>
                    setToggleUploadDialog(true)
                }
            >
                <AddIcon/>
            </Fab>
        </>
    )
}

function _QrDialog(props: {
    show: boolean;
    onClose: Function;
    url?: string;
}) {
    const {show, onClose, url} = props

    return (
        <Dialog
            onClose={() => onClose()}
            open={show}
            maxWidth='xs'
            fullWidth
        >
            <DialogContent
                sx={{
                    textAlign: 'center'
                }}
            >
                <QRCode value={url ?? ''}/>
            </DialogContent>
        </Dialog>
    )
}

function _UploadFileDialog(props: {
    show: boolean
    onClose: Function
    onDone: Function
}) {
    const {show, onClose, onDone} = props

    const [loading, setLoading] = useState<boolean>(false)

    const [file, setFile] = useState<File>()

    const uploadFile = useCallback(async () => {
        setLoading(true)
        if (file == null)
            return
        await FileService.uploadFile(file)
        setLoading(false)
        onDone()
    }, [file])

    useEffect(() => {
        setFile(undefined)
    }, [show])

    return (
        <Dialog
            onClose={() => onClose()}
            open={show}
            maxWidth='md'
            fullWidth
        >
            <DialogTitle>Upload File</DialogTitle>
            <DialogContent>
                <Dropzone
                    maxFiles={1}
                    onDrop={(files) => {
                        setFile(files[0])
                    }}
                >
                    {({getRootProps, getInputProps, acceptedFiles, isDragActive, isDragAccept}) => (
                        <Box
                            {...getRootProps()}
                            sx={{
                                bgcolor: '#e7e7e7',
                                height: '7rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderStyle: 'dashed',
                                borderWidth: '2px',
                                borderColor: '#9d9d9d',
                            }}
                        >
                            <input {...getInputProps()} hidden/>
                            {
                                !(isDragActive && isDragAccept) && acceptedFiles.length === 0
                                    ? <div
                                        style={{
                                            color: '#8c8c8c'
                                        }}
                                    >
                                        No File
                                    </div>
                                    : acceptedFiles.length === 0
                                        ? <div
                                            style={{
                                                color: '#8c8c8c'
                                            }}
                                        >
                                            Drag Here
                                        </div>
                                        : <div>{acceptedFiles.map(e => e.name)}</div>
                            }

                        </Box>
                    )}
                </Dropzone>
            </DialogContent>
            <DialogActions>
                <LoadingButton
                    loading={loading}
                    variant='contained'
                    onClick={() => uploadFile()}
                    disabled={file == null}
                >
                    upload
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
