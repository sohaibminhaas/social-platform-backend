import { Prisma, Status } from "@prisma/client";
import prismaClient from '../db/prisma';
import ErrorLogger from "../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import { Service_Response } from "../types/service-response";
import jwt from "jsonwebtoken";

export async function login(email: string, password: string): Promise<Service_Response<any>> {
    try {
        const user = await prismaClient.admins.findFirst({
            where: {
                AND: [
                    {
                        email: email
                    },
                    {
                        status: Status.ACTIVE
                    }
                ]
            },
            include:{
                admin_has_roles: true
            }
        });

        if (!user?.id) {
            return {
                status: false,
                statusMsg: "Admin not found with this email",
                data: user
            }
        }

        if (user.password !== password) {
            return {
                status: false,
                statusMsg: "Account credentials are not correct!",
                data: user
            }
        }

        const ids = user.admin_has_roles.map((role) => {
            return role.id
        });

        const permissions = await getPermissionsByRoleIds(ids);

        const session = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            admin_type: user.admin_type,
            phone_no: user.phone_no,
            permissions: permissions.data ?? [],
            token: ""
        }

        const token = jwt.sign(
            session,
            process.env.DASHBOARD_AUTH_TOKEN_KEY!,
            {
                expiresIn: "48h",
            }
        );
        session.token = token;

        return {
            status: true,
            statusMsg: "Successfully get Role",
            data: session
        }

    } catch (error) {
        logError("Error in login user", error);
        return {
            status: false,
            statusMsg: "Error in login user",
            data: undefined
        }
    }
}

export async function getPermissionsByRoleIds(roleIds: Array<number>): Promise<Service_Response<any>> {
    try {
        const roles = await prismaClient.roles.findMany({
            where: {
                id:{
                    in: roleIds
                }
            },
            include:{
                role_has_permissions: {
                    include:{
                        permissions: true
                    }
                }
            }
        });

        let userPermissions: Array<{
            id: number,
            title: string
        }> = [];

        roles.forEach((permissions) => {
            permissions.role_has_permissions.forEach((permission) =>{
                userPermissions.push({
                    id: permission.permissions.id,
                    title: permission.permissions.title,
                })
            })
        });

        return {
            status: true,
            statusMsg: "Successfully get permissions",
            data: userPermissions
        }
    } catch (error) {
        logError("Error in getting permissions", error);
        return {
            status: false,
            statusMsg: "Error in getting permissions",
            data: undefined
        }
    }
}