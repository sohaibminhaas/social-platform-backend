import express, { Application, Request, Response} from "express";
const app: Application = express();
import adminRoutes from "./routes/dashboard-routes";
import webRoutes from "./routes/web-routes";
import bodyparser from "body-parser";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";

app.use(cors());
app.use(
    bodyparser.urlencoded({
        extended: true,
    })
);
app.use(bodyparser.json());
app.use('/admin', adminRoutes())
app.use('/', webRoutes())
const port: string | number  = process.env.PORT ?? 5000;
app.listen(port, () => {
    console.log(`server is listing on port: ${port}`);
})