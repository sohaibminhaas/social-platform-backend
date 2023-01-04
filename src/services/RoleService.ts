import { Prisma, Status } from "@prisma/client";
import prismaClient from '../db/prisma';
import ErrorLogger from "../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import { Service_Response } from "../types/service-response";

type Role = {
    id: number | undefined | null,
    title: string,
    permissions: Array<number>
    status: Status
}

const mapPermissions = (permissions: Array<number>) => {
    return permissions.map((permission) => {
        return {
            permission_id: permission,
        }
    })
}

export async function create(role: Role): Promise<Service_Response<any>> {
    try {
        const new_role_response = await prismaClient.$transaction(async () => {
            const new_role = await prismaClient.roles.create({
                data: {
                    title: role.title,
                    status: role.status,
                    created_at: new Date().toISOString(),
                    role_has_permissions: {
                        createMany: {
                            data: mapPermissions(role.permissions)
                        }
                    }
                },
                include: {
                    role_has_permissions: true
                }
            })
            return new_role;
        });
        if (!new_role_response.id) {
            return {
                status: false,
                statusMsg: "failed to create role",
                data: new_role_response
            }
        }
        return {
            status: true,
            statusMsg: "Successfully Created Role",
            data: new_role_response
        }
    } catch (error) {
        logError("Error in creating role", error);
        return {
            status: false,
            statusMsg: "Error in creating role",
            data: undefined
        }
    }
}

export async function roles(): Promise<Service_Response<any>> {
    try {
        try {
            const roles = await prismaClient.roles.findMany({
                where: {
                    status: {
                        in: [Status.ACTIVE, Status.INACTIVE]
                    } 
                },
                orderBy: {
                    id: Prisma.SortOrder.desc
                },
                include: {
                    role_has_permissions: {
                        select: {
                            permission_id: true,
                            permissions: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true
                                }
                            }
                        }
                    }
                }
            });

            if (!(roles.length > 0)) {
                return {
                    status: false,
                    statusMsg: "failed to get roles",
                    data: roles
                }
            }
            return {
                status: true,
                statusMsg: "Successfully get Role",
                data: roles
            }
        } catch (error) {
            console.log("Error in getting all roles: ", error);
            return {
                status: false,
                statusMsg: "Error in getting all roles",
                data: undefined
            }
        }
    } catch (error) {
        logError("Error in getting roles", error);
        return {
            status: false,
            statusMsg: "Error in getting roles",
            data: undefined
        }
    }
}

export async function role(id: number): Promise<Service_Response<any>> {
    try {
        const role = await prismaClient.roles.findFirst({
            where: {
                id: id
            },
            include: {
                role_has_permissions: {
                    select: {
                        permission_id: true,
                        permissions: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!role?.id) {
            return {
                status: false,
                statusMsg: "failed to get role",
                data: role
            }
        }
        return {
            status: true,
            statusMsg: "Successfully get Role",
            data: role
        }

    } catch (error) {
        logError("Error in getting role", error);
        return {
            status: false,
            statusMsg: "Error in getting role",
            data: undefined
        }
    }
}

export async function edit(role: Role): Promise<Service_Response<any>> {
    try {
        const updated_role_response = await prismaClient.$transaction(async () => {
            await prismaClient.role_Has_Permissions.deleteMany({ where: { role_id: role?.id! } })
            const updated_role = await prismaClient.roles.update({
                where: {
                    id: Number(role.id)
                },
                data: {
                    title: role.title,
                    status: role.status,
                    role_has_permissions: {
                        createMany: {
                            data: mapPermissions(role.permissions)
                        }
                    }
                },
                include: {
                    role_has_permissions: true
                }
            })
            return updated_role

        });

        if (!updated_role_response.id) {
            return {
                status: false,
                statusMsg: "Failed to Updated Role",
                data: updated_role_response
            }
        }

        return {
            status: true,
            statusMsg: "Successfully updated Role",
            data: updated_role_response
        }
    } catch (error) {
        logError("Error in updatig role", error);
        return {
            status: false,
            statusMsg: "Error in updatig role",
            data: undefined
        }
    }
}