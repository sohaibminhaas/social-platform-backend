import express, {Request, Response} from "express";
const router = express.Router();
import dahboardAuth from "../../middleware/dashboard-auth";
import rolesRoutes from "../dashboard-routes/roles";
import { login } from "../../services/UserService";
import { permissions } from "../../services/PermissionService";
import ErrorLogger from "../../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import Joi from "joi";

export default module.exports = () => {
    router.get('/', (req: Request, res: Response) => {
        res.json({
            status: true,
            message: `Welcome To Dashboard Apis Routes For Social Platform!!`
        });
    });

    router.post('/login', async (req: Request, res: Response) => {
        try {
            const body = Object.assign(req.body);
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            });

            const validation = schema.validate({
                email: body.email,
                password: body.password,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }

            const response = await login(body.email, body.password); 
            return res.send(response);
        } catch (error) {
            logError("controller: error in login", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in login",
                data: undefined,
            });
        }
    });

    router.get('/permissions', dahboardAuth, async (req, res) => {
        try {
            const permissions_response = await permissions()
            res.send(permissions_response);
        } catch (error) {
            logError("controller: error in getting permissions", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in getting permissions",
                data: undefined,
            });
        }
    });

    router.use(rolesRoutes());
    return router;
}