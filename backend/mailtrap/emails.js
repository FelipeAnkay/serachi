import { mailtrapClient, sender } from "./mailtrap.js"
import { VERIFICATION_EMAIL_TEMPLATE, VERIFY_USER, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, SEND_QUOTE, SEND_FORMS, SEND_PROFILE, SEND_QUOTE_BAS, SEND_SCHEDULE } from "./emailTemplates.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification" //This is for analytics in Mailtrap
        })
        console.log("Email sent successfully", response)
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the email", error.message);
    }
}

export const sendWelcomeEmail = async (email, urlWelcome) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Serachi",
            html: VERIFY_USER.replace("{welcomeURL}", urlWelcome),
            category: "Email user verified" //This is for analytics in Mailtrap
        })
        //PENDIENTE REEMPLAZAR USUARIO Y URL
        console.log("Verified Email sent successfully", response)
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the Verified email", error.message);
    }
}

export const sendForgotPasswordEmail = async (email, resetUrl) => {
    const recipient = [{ email }];
    console.log("la url es:", resetUrl);
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Recovery",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Password Reset Request" //This is for analytics in Mailtrap
        })
        console.log("Password Request email sent", response)
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the password reset email", error.message);
    }
}


export const sendResetPasswordSuccessEmail = async (email) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password changed",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset success" //This is for analytics in Mailtrap
        })
        console.log("Password changed email sent", response)
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the password reset email", error.message);
    }
}

export const sendQuoteEmail = async (email, customerName, dateIn, dateOut, productList, roomList, discount, finalPrice, userEmail, userName, storeName, tcLink, plan) => {

    const recipient = [{ email }];

    const customSender = {
        email: userEmail,
        name: userName
    };

    const productRows = productList.map((product) => {
        return `
          <tr>
            <td>${product.productName}</td>
            <td>$${product.productUnitaryPrice}</td>
            <td>${product.Qty}</td>
            <td>$${product.productFinalPrice}</td>
          </tr>
        `;
    }).join("");

    let roomRows;

    if (roomList && roomList.length > 0) {
        roomRows = roomList.map((room) => {
            return `
      <tr>
        <td>${room.roomName || '-'}</td>
        <td>${new Date(room.roomDateIn).toISOString().split('T')[0] || '-'}</td>
        <td>${new Date(room.roomDateOut).toISOString().split('T')[0] || '-'}</td>
        <td>${room.roomFinalPrice !== undefined ? `$${room.roomFinalPrice}` : '-'}</td>
      </tr>
    `;
        }).join("");
    } else {
        roomRows = `
    <tr>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
  `;
    }

    const tycLink = () => {
        return `
            <a href="${tcLink}" target="_blank">Link</a>
        `;
    };

    const html = SEND_QUOTE
        .replace('{{customerName}}', customerName)
        .replace('{{dateIn}}', dateIn)
        .replace('{{dateOut}}', dateOut)
        .replace('{{discount}}', discount)
        .replace('{{finalPrice}}', finalPrice)
        .replace('{{roomList}}', roomRows)
        .replace('{{productList}}', productRows)
        .replace('{{tycLink}}', tycLink
        );
    const html_bas = SEND_QUOTE_BAS
        .replace('{{customerName}}', customerName)
        .replace('{{dateIn}}', dateIn)
        .replace('{{dateOut}}', dateOut)
        .replace('{{discount}}', discount)
        .replace('{{finalPrice}}', finalPrice)
        .replace('{{roomList}}', roomRows)
        .replace('{{productList}}', productRows
        );

    const customSubject = storeName + " Quote"

    let finalHtml = ""

    if(plan!="BAS"){
        finalHtml = html;
    }else{
        finalHtml = html_bas;
    }

    //console.log("Los datos para sendQuoteEmail:", recipient, " - ", customSender, " - ", productRows, " - ", html, " - ", storeName, " - ", customSubject);

    try {
        //console.log("Entré al TRY de sendQuoteEmail:", customSender, " - ", recipient, " - ", customSubject, " - ", html);
        const response = await mailtrapClient.send({
            from: customSender,
            to: recipient,
            subject: customSubject,
            html: finalHtml,
            category: "Quote",
        });
        console.log("Quote Sent", response);
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the quote email", error.message);
    }
}

export const sendProfileEmail = async (email, customerName, userEmail, userName, storeName, webUrl, urlToken) => {
    /*
    console.log("Entre a sendFormEmail", {
            email,
            customerName,
            userEmail,
            userName,
            storeName,
            webUrl,
            urlToken
        })
    */
    const recipient = [{ email }];

    const customSender = {
        email: userEmail,
        name: userName
    };

    const formRows = () => {
        const fullUrl = `${webUrl}?token=${urlToken}`;
        return `
      <tr>
        <td>${customerName}</td>
        <td><a href="${fullUrl}" target="_blank">Link</a></td>
      </tr>
    `;
    };


    const html = SEND_PROFILE
        .replace('{{customerName}}', customerName)
        .replace('{{formList}}', formRows // reemplaza el bloque con las filas generadas
        );

    const customSubject = storeName + " Profile completion is required"
    /*
        console.log("Variables a enviar: ", {
                customSender,
                recipient,
                customSubject,
                html,
            })
    */
    try {
        //console.log("Entré al TRY de sendQuoteEmail:", customSender, " - ", recipient, " - ", customSubject, " - ", html);
        const response = await mailtrapClient.send({
            from: customSender,
            to: recipient,
            subject: customSubject,
            html,
            category: "Profile",
        });
        //console.log("Form Sent", response);
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the quote email", error.message);
    }
}

export const sendFormEmail = async (email, customerName, formList, userEmail, userName, storeName, urlToken) => {
    /*
    console.log("Entre a sendFormEmail", {
            email,
            customerName,
            formList,
            userEmail,
            userName,
            storeName,
            urlToken
        })
    */
    const recipient = [{ email }];

    const customSender = {
        email: userEmail,
        name: userName
    };

    const formRows = formList.map((form) => {
        const fullUrl = `${form.url}?token=${urlToken}`;
        return `
      <tr>
        <td>${form.name}</td>
        <td><a href="${fullUrl}" target="_blank">Sign Form</a></td>
      </tr>
    `;
    }).join("");


    const html = SEND_FORMS
        .replace('{{customerName}}', customerName)
        .replace('{{formList}}', formRows // reemplaza el bloque con las filas generadas
        );

    const customSubject = storeName + " Sign Form Required"
    /*
        console.log("Variables a enviar: ", {
                customSender,
                recipient,
                customSubject,
                html,
            })
    */
    try {
        //console.log("Entré al TRY de sendQuoteEmail:", customSender, " - ", recipient, " - ", customSubject, " - ", html);
        const response = await mailtrapClient.send({
            from: customSender,
            to: recipient,
            subject: customSubject,
            html,
            category: "Forms",
        });
        //console.log("Form Sent", response);
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the quote email", error.message);
    }
}

export const sendScheduleEmail = async (email, staffName, userEmail, userName, storeName, webUrl, urlToken) => {
    /*
    console.log("Entre a sendFormEmail", {
            email,
            customerName,
            userEmail,
            userName,
            storeName,
            webUrl,
            urlToken
        })
    */
    const recipient = [{ email }];

    const customSender = {
        email: userEmail,
        name: userName
    };

    const actualMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
    const capitalizedMonth = actualMonth.charAt(0).toUpperCase() + actualMonth.slice(1);

    const formRows = () => {
        const fullUrl = `${webUrl}?token=${urlToken}`;
        return `
      <tr>
        <td>${capitalizedMonth}</td>
        <td><a href="${fullUrl}" target="_blank">Link</a></td>
      </tr>
    `;
    };


    const html = SEND_SCHEDULE
        .replace('{{staffName}}', staffName)
        .replace('{{formList}}', formRows // reemplaza el bloque con las filas generadas
        );

    const customSubject = storeName + " Monthly Schedule"
    /*
        console.log("Variables a enviar: ", {
                customSender,
                recipient,
                customSubject,
                html,
            })
    */
    try {
        //console.log("Entré al TRY de sendQuoteEmail:", customSender, " - ", recipient, " - ", customSubject, " - ", html);
        const response = await mailtrapClient.send({
            from: customSender,
            to: recipient,
            subject: customSubject,
            html,
            category: "Schedule",
        });
        //console.log("Form Sent", response);
    } catch (error) {
        console.error(error.message);
        throw new Error("Error sending the schedule email", error.message);
    }
}