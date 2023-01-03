import { AdminType, Prisma, Status } from "@prisma/client";
import prismaClient from '../db/prisma';
import ErrorLogger from "../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import { Service_Response } from "../types/service-response";
import { getTempSigninDetails } from "./SingnInService";

type Employee = {
    id: number | undefined | null,
    firstName: string,
    lastName: string
    email: string
    phone_no: string
    status: Status
    img: string | undefined | null,
    roleIds: Array<number>
}

const mapRoles = (roles: Array<number>) => {
    return roles.map((role) => {
        return {
            role_id: role,
        }
    })
}

export async function create(employee: Employee): Promise<Service_Response<any>> {
    try {
        const new_employee_response = await prismaClient.$transaction(async () => {
            const new_employee = await prismaClient.admins.create({
                data: {
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phone_no: employee.phone_no,
                    admin_type: AdminType.EMPLOYEE,
                    status: Status.PENDING,
                    img: employee.img,
                    created_at: new Date().toISOString(),
                    admin_has_roles: {
                        createMany: {
                            data: mapRoles(employee.roleIds)
                        }
                    }
                },
                include: {
                    admin_has_roles: true
                }
            })
            return new_employee;
        });
        if (!new_employee_response.id) {
            return {
                status: false,
                statusMsg: "failed to create employee",
                data: new_employee_response
            }
        }
        return {
            status: true,
            statusMsg: "Successfully Created employee",
            data: new_employee_response
        }
    } catch (error) {
        logError("Error in creating employee", error);
        return {
            status: false,
            statusMsg: "Error in creating employee",
            data: undefined
        }
    }
}

export async function activateEmployee({
    temp_id,
    code,
    password
}: {
    temp_id: number;
    code: number;
    password: string;
}) {
    try {
        const admin_response = await prismaClient.$transaction(async (prisma) => {
            const temp_sign_in_response = await getTempSigninDetails(temp_id, code);
            if (!temp_sign_in_response.status) {
                return temp_sign_in_response;
            }

            const admin = await prismaClient.admins.findFirst({
                where: {
                    id: temp_sign_in_response.data.type_id
                }
            });

            if (!admin) {
                return {
                    status: false,
                    statusMsg: "failed to get employee",
                    data: undefined
                }
            }

            const updateAdmin = await prismaClient.admins.update({
                where: {
                    id: Number(temp_sign_in_response.data.type_id)
                },
                data: {
                    password: password,
                    status: Status.ACTIVE
                }
            });

            if (!updateAdmin) {
                return {
                    status: false,
                    statusMsg: "failed to update employee password",
                    data: admin
                }
            }

            await prismaClient.tempSignIn.update({
                where: {
                    id: Number(temp_id)
                },
                data: {
                    is_validated: true
                }
            });

            return {
                status: true,
                statusMsg: "Successfully password updated.",
                data: updateAdmin
            };
        });
        return admin_response;
    } catch (error) {
        logError("Error in updating password", error);
        return {
            status: false,
            statusMsg: "Error in updating password",
            data: undefined
        }
    }
}

export async function employees(): Promise<Service_Response<any>> {
    try {
        try {
            const roles = await prismaClient.admins.findMany({
                orderBy: {
                    id: Prisma.SortOrder.desc
                },
                include: {
                    admin_has_roles: {
                        include:{
                            role: true
                        }
                    }
                }
            });

            if (!(roles.length > 0)) {
                return {
                    status: false,
                    statusMsg: "failed to get employees",
                    data: roles
                }
            }
            return {
                status: true,
                statusMsg: "Successfully get employees",
                data: roles
            }
        } catch (error) {
            console.log("Error in getting all employees: ", error);
            return {
                status: false,
                statusMsg: "Error in getting all employees",
                data: undefined
            }
        }
    } catch (error) {
        logError("Error in getting employees", error);
        return {
            status: false,
            statusMsg: "Error in getting employees",
            data: undefined
        }
    }
}

export async function employee(id: number): Promise<Service_Response<any>> {
    try {
        const employee = await prismaClient.admins.findFirst({
            where: {
                id: id
            },
            include: {
                admin_has_roles: {
                    include:{
                        role: true
                    }
                }
            }
        });

        if (!employee?.id) {
            return {
                status: false,
                statusMsg: "failed to get employee",
                data: employee
            }
        }
        return {
            status: true,
            statusMsg: "Successfully get employee",
            data: employee
        }

    } catch (error) {
        logError("Error in getting employee", error);
        return {
            status: false,
            statusMsg: "Error in getting employee",
            data: undefined
        }
    }
}

export async function edit(employee: Employee): Promise<Service_Response<any>> {
    try {
        const updated_employee_response = await prismaClient.$transaction(async () => {
            await prismaClient.admin_Has_Roles.deleteMany({ where: { admin_id: employee.id! } });
            const updated_employee = await prismaClient.admins.update({
                where: {
                    id: Number(employee.id)
                },
                data: {
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phone_no: employee.phone_no,
                    admin_type: AdminType.EMPLOYEE,
                    status: employee.status,
                    img: employee.img,
                    created_at: new Date().toISOString(),
                    admin_has_roles: {
                        createMany: {
                            data: mapRoles(employee.roleIds)
                        }
                    }
                },
                include: {
                    admin_has_roles: true
                }
            })
            return updated_employee
        });

        if (!updated_employee_response.id) {
            return {
                status: false,
                statusMsg: "Failed to Updated Employee",
                data: updated_employee_response
            }
        }

        return {
            status: true,
            statusMsg: "Successfully updated Employee",
            data: updated_employee_response
        }
    } catch (error) {
        logError("Error in updatig Employee", error);
        return {
            status: false,
            statusMsg: "Error in updatig Employee",
            data: undefined
        }
    }
}

