import { Prisma, Status, Type } from "@prisma/client";
import prismaClient from '../db/prisma';
import ErrorLogger from "../utils/error-handler";
import { RandomCode } from "../utils/helper";
const { logger, logError } = new ErrorLogger();
import { Service_Response } from "../types/service-response";
import { sendTempSignInEmail } from "../utils/send-email";

type TempSignIn = {
    id: number,
    messageType: "email" | "whatsapp"
}

export async function sendWhatsAppOrEmailForTempSignIn(data: TempSignIn): Promise<Service_Response<any>> {
    try {
        const { id, messageType } = data;
        let code = RandomCode();
        const temp_signin_response = await prismaClient.$transaction(async (prisma) => {
            const temp_response = await prismaClient.admins.findFirst({
                where: {
                    id: Number(id)
                },
                select: {
                    id: true,
                    email: true,
                    phone_no: true
                }
            });

            if (!temp_response) {
                return {
                    status: false,
                    statusMsg: "failed to get admin for sending email or whatsapp",
                    data: undefined
                }
            }

            let temp_sign_in = await prismaClient.tempSignIn.findFirst({
                where: {
                    AND: [
                        {
                            type_id: temp_response?.id
                        },
                        {
                            type: Type.EMPLOYEE
                        },
                        {
                            is_validated: false
                        }
                    ]
                },
                select: {
                    id: true,
                    code: true
                },
            });

            if (!temp_sign_in) {
                temp_sign_in = await prismaClient.tempSignIn.create({
                    data: {
                        type: Type.EMPLOYEE,
                        type_id: temp_response!.id,
                        code: code,
                        createdAt: new Date().toISOString(),
                    }
                });
            }

            code = temp_sign_in.code;
            if (!temp_sign_in.id) {
                return {
                    status: false,
                    statusMsg: "failed to create temp sign in.",
                    data: undefined
                }
            }

            if (messageType === "email" && temp_sign_in) {
                await sendTempSignInEmail(code, temp_response.email, Type.EMPLOYEE, temp_sign_in.id);
            }
            else if (messageType === "whatsapp" && temp_sign_in) {
                await sendTempSignInEmail(code, temp_response.email, Type.EMPLOYEE, temp_sign_in.id);
            }

            return {
                status: true,
                statusMsg: "Email has been successfully sent.",
                data: temp_sign_in
            }
        });
        return temp_signin_response;
    } catch (error) {
        logError("Error in sending temp sign in email.", error);
        return {
            status: false,
            statusMsg: "Error in sending temp sign in email.",
            data: undefined
        }
    }
}

export async function getTempSigninDetails(id: number, code: number): Promise<Service_Response<any>> {
    try {
        const temp_sign_in_details = await prismaClient.tempSignIn.findFirst({
            where: {
                AND: [
                    {
                        is_validated: false
                    },
                    {
                        id: Number(id)
                    },
                    {
                        code: Number(code)
                    }
                ]
            },
            select: {
                id: true,
                type_id: true,
                type: true,
                code: true
            }
        })
        if (!temp_sign_in_details) {
            return {
                status: false,
                statusMsg: "No details found. Invalid code or code already been used",
                data: undefined
            }
        }

        return {
            status: true,
            statusMsg: "successfully get temp signin details",
            data: temp_sign_in_details
        }
    } catch (error) {
        logError("Error in getting temp signin details.", error);
        return {
            status: false,
            statusMsg: "Error in getting temp signin details.",
            data: undefined
        }
    }
}