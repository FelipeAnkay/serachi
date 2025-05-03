import { mailtrapClient, sender } from "./mailtrap.js"
import { VERIFICATION_EMAIL_TEMPLATE, VERIFY_USER, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemplates.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification" //This is for analytics in Mailtrap
        })
        console.log("Email sent successfully", response)
    }catch(error){
        console.error(error.message);
        throw new Error("Error sending the email", error.message);
    }
}

export const sendWelcomeEmail = async (email, urlWelcome) => {
    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Serachi",
            html: VERIFY_USER.replace("{welcomeURL}", urlWelcome),
            category: "Email user verified" //This is for analytics in Mailtrap
        })
        //PENDIENTE REEMPLAZAR USUARIO Y URL
        console.log("Verified Email sent successfully", response)
    }catch(error){
        console.error(error.message);
        throw new Error("Error sending the Verified email", error.message);
    }
}

export const sendForgotPasswordEmail = async (email, resetUrl) => {
    const recipient = [{email}];
    console.log("la url es:", resetUrl);
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Recovery",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Password Reset Request" //This is for analytics in Mailtrap
        })
        console.log("Password Request email sent", response)
    }catch(error){
        console.error(error.message);
        throw new Error("Error sending the password reset email", error.message);
    }
}


export const sendResetPasswordSuccessEmail = async (email) => {
    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password changed",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset success" //This is for analytics in Mailtrap
        })
        console.log("Password changed email sent", response)
    }catch(error){
        console.error(error.message);
        throw new Error("Error sending the password reset email", error.message);
    }
}