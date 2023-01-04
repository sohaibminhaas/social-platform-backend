import express from "express";
const router = express.Router();
import dahboardAuth from "../../middleware/dashboard-auth";
import { create, edit, role, roles } from "../../services/RoleService";
import ErrorLogger from "../../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import Joi from "joi";
import { Status } from "@prisma/client";

export default module.exports = () => {
    router.post('/roles', dahboardAuth, async (req, res) => {
        try {
            const role = Object.assign(req.body);
            const schema = Joi.object({
                title: Joi.string().required(),
                permissions: Joi.array().items(Joi.number()).min(1).required(),
                status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE),
            });

            const validation = schema.validate({
                title: role.title,
                permissions: role.permissions,
                status: role.status
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }

            const role_response = await create(role)
            res.send(role_response);
        } catch (error) {
            logError("controller: error in creating role", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in creating role",
                data: undefined,
            });
        }
    });

    router.put('/roles/:id', dahboardAuth, async (req, res) => {
        try {
            const role = Object.assign(req.body);
            const schema = Joi.object({
                id: Joi.number().required(),
                title: Joi.string().required(),
                permissons: Joi.array().items(Joi.number()).min(1),
                status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE)
            });

            const validation = schema.validate({
                id: role.id,
                title: role.title,
                permissons: role.permissions,
                status: role.status
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }
            const role_response = await edit(role)
            res.send(role_response);
        } catch (error) {
            logError("controller: error in getting single role", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in getting single role",
                data: undefined,
            });
        }
    });

    router.get('/roles', dahboardAuth, async (req, res) => {
        try {
            const roles_response = await roles()
            res.send(roles_response);
        } catch (error) {
            logError("controller: error in getting all roles", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in getting all roles",
                data: undefined,
            });
        }
    });

    router.get('/roles/:id', dahboardAuth, async (req, res) => {
        try {
            const roleId: number = Number(req.params.id);
            const schema = Joi.object({
                id: Joi.number().required(),
            });

            const validation = schema.validate({
                id: roleId,
            });

            if (validation.error) {
                return res.status(400).json({
                    status: false,
                    statusMsg: "Data validation failed",
                    data: validation.error,
                });
            }
            const role_response = await role(roleId)
            res.send(role_response);
        } catch (error) {
            logError("controller: error in updating role", error);
            return res.status(500).json({
                status: false,
                statusMsg: "controller: error in updating role",
                data: undefined,
            });
        }
    });

    return router;
}