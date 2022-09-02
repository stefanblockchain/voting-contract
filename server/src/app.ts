import express, { Application } from 'express';
import * as dotenv from "dotenv";
import cors from 'cors';
import routes from './routes/routes';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api', routes);

const port: number = 3000;

app.listen(port, () => console.log('Server started'));