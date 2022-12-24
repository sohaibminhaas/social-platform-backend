import express, {Request, Response} from "express";
const router = express.Router();
import dahboardAuth from "../../middleware/dashboard-auth";
import jwt from "jsonwebtoken";

export default module.exports = () => {
    router.get('/', (req: Request, res: Response) => {
        res.json({
            status: true,
            message: `Welcome To Dashboard Apis Routes For Social Platform!!`
        });
    });

    router.get('/login', (req: Request, res: Response) => {
        try {
            // const body = Object.assign(req.body);
            // if (!body) {
            //     res.json({
            //         status: false,
            //         message: `failed`,
            //         data: undefined
            //     });
            // }
            const user = {
                id: 1,
                firstName: "Sohaib",
                lastname: "Riaz",
                email: "sohaib.minhas@outlook.com",
                status: "ACTIVE",
                token:  ''
            }
            const token = jwt.sign(
                user,
                process.env.DASHBOARD_AUTH_TOKEN_KEY!,
                {
                    expiresIn: "2h",
                }
            );
            user.token = token;
            res.json({
                status: true,
                message: `Success`,
                data: user
            });
        } catch (error) {
            console.error("error in login", error);
        }
    });

    router.get('/welcome', dahboardAuth, (req: Request, res: Response) => {
        res.json({
            status: true,
            message: `Hello World!`
        });
    });

    return router;
}