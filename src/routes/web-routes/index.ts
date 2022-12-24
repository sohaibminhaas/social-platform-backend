import express, {Request, Response} from "express";
const router = express.Router();

export default module.exports = () => {
    router.get('/', (req: Request, res: Response) => {
        res.json({
            status: true,
            message: `Welcome To Web/App Apis Routes For Social Platform!!`
        });
    });
    return router;
}