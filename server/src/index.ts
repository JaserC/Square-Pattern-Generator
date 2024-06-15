import express, { Express } from "express";
import { save, list, load } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());

//Save api designed to call save function in routes
app.post("/api/save", save);

//List api designed to call list function in routes
app.get("/api/list", list);

//Load api designed to call load function in routes
app.get("/api/load", load);

app.listen(port, () => console.log(`Server listening on ${port}`));
