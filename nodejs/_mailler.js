//Loud NPM Modules
const nodemailer = require('nodemailer')
const fs = require('fs')
//Loud Inner Variables
const variables = require("../configs/config.json")
//Create Log de Envios
const envs = fs.createWriteStream("../logs/logs.txt", { flags: 'a' })
//Build Variables
let nows = {}
let snd = {}
snd.attachments = []
//Get Current Date
const getDate = () => {
    let data = new Date();
    nows.date = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`
    nows.hour = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
    nows.fullDate = `${nows.date} ${nows.hour}`
}
getDate()
// async..await is not allowed in global scope, must use a wrapper
const main = async (res) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: `${variables.mailler.host}`,
        port: variables.mailler.port,
        secure: false,
        requireTLS: true,
        auth: {
            user: `${variables.mailler.user}`,
            pass: Buffer.from(`${variables.mailler.pass}`, 'base64')
        }
    });  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `${variables.variables.emailName} <${variables.mailler.user}>`, // sender address
      to: `${snd.mail}`, // list of receivers
      attachments: snd.attachments,
      subject: "Xmls transporte Sales", // Subject line
      text: "Segue os XMLS para averbação.", // plain text body
      html: "<b>Segue os XMLS para averbação.</b>", // html body
    });
    //Set Log de Envio
    envs.write(`E-mail: ${snd.mail}, enviado. Status Message: ${JSON.stringify(info)}}`)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>  
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    console.log(info);
    console.log(JSON.stringify(info));
    res.json({message: "ok"})
}
//Add Attachments to Email in NodeMailer
const addAttachment = async (files, pathfile) => {
    try {
        snd.attachments.push({filename: `${files.chave}-procNFe.xml`, content: fs.createReadStream(pathfile.server14)})
        envs.write(`Arquivo Acrescentado: ${pathfile.auto.file}\n`)
    } catch (error) {
        envs.write(`Arquivo Acrescentado: ${error}\n`)
        return res.json({status: 0, message: "fail"})
    }
}
//Error Message
const output = (res, status = 0, message = '') => res.json({status: status, message: message})
//Loud NPM Modules
const setNodeMailerToSend = async (req, res) => {
    let data = req.body
    //Output Message 
    if (data.data.notas === '' || data.data.notas === null) return output(res, 0, "Favor anexar arquivos para enviar o E-mail!")
    //Set Email para envio
    snd.mail = data.data.email
    if (snd.mail === '') return res.json({status: 0, message: "Favor informar o E-mail para enviar os arquivos!"})
    //Get Linhas para Acrescentar no E-mail em Anexo
    envs.write(`/* -------------------------------- Start Processo [${nows.fullDate}] -------------------------------- */\n`)
    snd.attachments = []
    for (const linhas of data.data.notas) await addAttachment(linhas, linhas.pathfile)
    //Tentar Enviar
    try {
        await main(res);
    } catch(error) {
        console.log(error);
    }
}
module.exports = { setNodeMailerToSend }