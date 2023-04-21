import * as express from 'express'
import * as http from 'http'
import {Server} from 'socket.io'
import * as bodyParser from 'body-parser'
import {FileRoutes} from "./routes";
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as fileUpload from 'express-fileupload'

dotenv.config();

const app = express();
const io = new Server()
const server = http.createServer(app)
const servIo = io.listen(server)

app.use(cors({
    origin: '*'
}))
app.use(bodyParser.json())
app.use(fileUpload());
app.use("/api/file", FileRoutes)

const {PORT = 4000} = process.env;
server.listen(PORT, () => {
    console.log(`  App running in port ${PORT}`);
    console.log(`  > Local: \x1b[36mhttp://localhost:\x1b[1m${PORT}/\x1b[0m`);
});
