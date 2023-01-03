import express from "express";
const router = express.Router();
import dahboardAuth from "../../middleware/dashboard-auth";
import { create, edit, employee, employees, activateEmployee } from "../../services/EmployeeService";
import { sendWhatsAppOrEmailForTempSignIn, getTempSigninDetails } from "../../services/SingnInService";
import ErrorLogger from "../../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import Joi from "joi";
import { Status } from "@prisma/client";


export default module.exports = () => {
    router.post('/employees', dahboardAuth, async (req, res) => {
        try {
            const employee = Object.assign(req.body);
            const schema = Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().required(),
                phone_no: Joi.string().required(),
                img: Joi.string().optional(),
                roleIds: Joi.array().items(Joi.number()).min(1).required(),
            });

            const validation = schema.validate({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone_no: employee.phone_no,
                img: employee.img,
                roleIds: employee.roleIds,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }

            const employee_response = await create(employee)
            res.send(employee_response);
        } catch (error) {
            logError("controller: error in creating employee", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in creating employee",
                data: undefined,
            });
        }
    });

    router.put('/employees/:id', dahboardAuth, async (req, res) => {
        try {
            const employee = Object.assign(req.body);
            const schema = Joi.object({
                id: Joi.number().required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().required(),
                phone_no: Joi.string().required(),
                img: Joi.string().optional(),
                roleIds: Joi.array().items(Joi.number()).min(1).required(),
                status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE)
            });

            const validation = schema.validate({
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone_no: employee.phone_no,
                img: employee.img,
                roleIds: employee.roleIds,
                status: employee.status
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }

            if(req.params.id != employee.id){
                return res.status(400).json({
                    status: false,
                    statusMsg: "Invalid Admin Id",
                    data: validation.error,
                });
            }

            const employee_response = await edit(employee)
            res.send(employee_response);
        } catch (error) {
            logError("controller: error in getting single employee", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in getting single employee",
                data: undefined,
            });
        }
    });

    router.get('/employees', dahboardAuth, async (req, res) => {
        try {
            const employess_response = await employees()
            res.send(employess_response);
        } catch (error) {
            logError("controller: error in getting all employees", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in getting all employees",
                data: undefined,
            });
        }
    });

    router.get('/employees/:id', dahboardAuth, async (req, res) => {
        try {
            const employeeId: number = Number(req.params.id);
            const schema = Joi.object({
                id: Joi.number().required(),
            });

            const validation = schema.validate({
                id: employeeId,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }
            const employee_response = await employee(employeeId)
            res.send(employee_response);
        } catch (error) {
            logError("controller: error in updating employee", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in updating employee",
                data: undefined,
            });
        }
    });

    router.get('/employees/:id/send/email', async (req, res) => {
        try {
            const data = Object.assign(req.params);
            const schema = Joi.object({
                id: Joi.number().required(),
            });

            const validation = schema.validate({
                id: data.id,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }

            return res.send(await sendWhatsAppOrEmailForTempSignIn({ id: data.id, messageType: "email" }))
        } catch (error) {
            logError("controller: error in sending email", error);
            return res.send({
                status: false,
                statusMsg: "Error in sending email",
                data: undefined
            });
        }
    });

    router.post('/employees/temp/login', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            const schema = Joi.object({
                temp_id: Joi.number().required(),
                code: Joi.number().required(),
            });

            const validation = schema.validate({
                temp_id: data.temp_id,
                code: data.code,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }
            return res.send(await getTempSigninDetails(data.temp_id, data.code))
        } catch (error) {
            logError("controller: Error in getting temp signin details.", error);
            return res.send({
                status: false,
                statusMsg: "controller: Error in getting temp signin details.",
                data: undefined
            })
        }
    });

    router.post('/employees/password/create', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            const schema = Joi.object({
                temp_id: Joi.number().required(),
                code: Joi.number().required(),
                password: Joi.number().required(),
            });

            const validation = schema.validate({
                temp_id: data.temp_id,
                code: data.code,
                password: data.password,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }
            return res.send(await activateEmployee({
                temp_id: data.temp_id,
                code: data.code,
                password: data.password
            }));
        } catch (error) {
            logError("controller: Error in updating password.", error);
            return res.send({
                status: false,
                statusMsg: "controller: Error in updating password.",
                data: undefined
            })
        }
    });

    return router;
}