import { Prisma, Status } from "@prisma/client";
import prismaClient from '../db/prisma';
import ErrorLogger from "../utils/error-handler";
const { logger, logError } = new ErrorLogger();
import { Service_Response } from "../types/service-response";

export async function permissions(): Promise<Service_Response<any>> {
    try {
        try {
            const permissions = await prismaClient.permissions.findMany({
                where: {
                    status: Status.ACTIVE
                },
                select:{
                    id: true,
                    title: true,
                }
            });

            if (!(permissions.length > 0)) {
                return {
                    status: false,
                    statusMsg: "failed to get permissions",
                    data: permissions
                }
            }
            return {
                status: true,
                statusMsg: "Successfully Get Permissions",
                data: permissions
            }
        } catch (error) {
            console.log("Error in getting all permissions: ", error);
            return {
                status: false,
                statusMsg: "Error in getting all permissions",
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
