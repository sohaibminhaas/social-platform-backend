import sendGrid from "@sendgrid/mail";
sendGrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendTempSignInEmail(code: number, email: string, type: string, id: number) {
    try {
        if (code) {
            const body = `<!DOCTYPE html>
                        <html lang="en">
                            <body style=" max-width: 1020px; margin: 0 auto;">
                                <div> <span>Hello There</span> </div>
                                <div> <span>Here is your temporary sign in link with password</span> </div>
                                <div> <span>Please visit the link to reset your password</span> </div>
                                <div> <span><a href="${process.env.BASEURL}/temporary/signin/${id}"><b>Please Click Here</b></a></span> </div>
                                <div> <span>Code <b> ${code}</b></span> </div>
                            </body>
                        </html>`
            let msg: any = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: `New ${type} Temporary Signin`,
                html: body
            };
            console.log("msg:", msg)
            const emailSerRes = await sendGrid.send(msg);
            console.log("Send Email Response", emailSerRes);
        }
    } catch (error) {
        console.error("error in sending emails", error);
    }
}