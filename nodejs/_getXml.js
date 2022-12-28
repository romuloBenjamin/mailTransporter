//Loud xml inner Variables
let nfe = {}
nfe.date = {}
//Load Ext scripts to run
const { executeQuery } = require('./database.js')
//Get Current Date
const getDate = () => {
    let data = new Date();
    nfe.date.date = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`
    nfe.date.hour = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
    nfe.date.fullDate = `${nfe.date.date} ${nfe.date.hour}`
}
//Get data in folder Format
const getFolderFormatDate = async (data) => {
    let gdate = new Date(data);
    return [`${gdate.getFullYear()}\\${(gdate.getMonth() + 1).toString().padStart(2, '0')}\\${gdate.getDate().toString().padStart(2, '0')}`, `${gdate.getFullYear()}/${(gdate.getMonth() + 1).toString().padStart(2, '0')}/${gdate.getDate().toString().padStart(2, '0')}`]
}
getDate()
//Get Dados de Empresas
const getCompaniesData = async (cnpj) => {
    if (cnpj === "10290557000168") return {name: "SALES EQUIP. E PROD. HIG. PROF. LTDA.", cnpj: "10290557000168", alt: "Equipamentos"}
    if (cnpj === "66826918000100") return {name: "SALES IND. COM. DE MAQUINAS LTDA.", cnpj: "66826918000100", alt: "Industria"}
    if (cnpj === "21823607000141") return {name: "COMERCIAL SANDALO LTDA", cnpj: "21823607000141", alt: "Sandalo_Comercial"}
    if (cnpj === "30379727000192") return {name: "SANDALO EQUIP E PROD HIG PESSOAL LTDA", cnpj: "30379727000192", alt: "Sandalo_Equipamentos"}
    if (cnpj === "35765246000139") return {name: "DONA COM. ELETRONICO DE PROD. DESC. LTDA.", cnpj: "35765246000139", alt: "Dona"}
    if (cnpj === "47498059000115") return {name: "E.DONA COM ELET PRODUTOS DESCARTAVEIS", cnpj: "47498059000115", alt: "EDona"}
}
//Build SQL STATEMENTS (Get Emitente)
const setSQLEmitenteID = () => "SELECT emi_id, emi_nome FROM empresa_notas_emitentes WHERE emi_cnpj = ?"
//Build SQL STATEMENTS (Get NFe data)
const setSQLParserQuery = (emitenteID, dataEmissao = '', nfe = '', type = 1) => {
    let sql = "SELECT empresa_notas.nf_emissao, empresa_notas.nf_numero, empresa_notas.nf_chave, empresa_notas.nf_valor, empresa_notas_destinatarios.des_nome, empresa_notas_destinatarios.des_documento, empresa_notas_destinatarios.des_email"
    sql += " FROM empresa_notas INNER JOIN empresa_notas_destinatarios ON empresa_notas.nf_destinatario = empresa_notas_destinatarios.des_id"
    sql += " WHERE"
    if (emitenteID !== '') sql += ` empresa_notas.nf_emitente = '${emitenteID}'`
    //Set Data de Emissão se Existir campo nas Variaveis passadas
    if (dataEmissao !== '') sql += ` AND empresa_notas.nf_emissao LIKE '${dataEmissao}%'`
    //Set NFe Conforme Quantidade de digitos
    if (type == 1) sql += ` AND empresa_notas.nf_numero = '${nfe}'`
    if (type == 2) sql += ` AND empresa_notas.nf_numero LIKE '${nfe}%'`
    return sql
}
//Error Message
const output = (res, status = 0, message = '') => res.json({status: status, message: message})
//Get NFe Informations to Get Xml
const getNfeInfos = async (res, nfe, data, type = 1) => {
    console.log(data);
    let sql = setSQLParserQuery(nfe.emitente.id, data.date, data.nfe, type)
    //Execute Dados From SQLStatements
    console.log(`Pesquisando: ${sql}`);
    await executeQuery(sql)
        .then(async ([rows, fields]) => {
            //If Resultados from igual a Zero Refaz a Pesquisa para Igualdade
            if (rows.length === 0) return getNfeInfos(res, nfe, data, type = 2)
            //If Resultados dependendo do resultado se Type 1 ou 2 (equals or like)
            let datta = []
            for (const linhas of rows) {
                //Get Dados do Emitente
                let dest = await getCompaniesData(data.cnpj)
                //Get data in folder Format
                let folderDate = await getFolderFormatDate(linhas.nf_emissao)
                //Get dados para Listagem de envio
                datta.push({
                    destinatario: {
                        cliente: (linhas.des_nome == null)? "" : linhas.des_nome,
                        documento: (linhas.des_documento == null)? "" : linhas.des_documento,
                        email: (linhas.des_email == null)? "" : linhas.des_email,
                    },
                    emitente: {
                        nome: (dest.name == null)? "" : dest.name, 
                        documento: (dest.cnpj == null)? "" : dest.cnpj
                    },
                    emissao: (linhas.nf_emissao == null)? "" : linhas.nf_emissao,
                    numero: (linhas.nf_numero == null)? "" : linhas.nf_numero,
                    chave: (linhas.nf_chave == null)? "" : linhas.nf_chave,
                    valor: (linhas.nf_valor == null)? "" : linhas.nf_valor,                    
                    pathfile: {
                        server14: `\\\\172.16.0.14\\BackupXML\\${dest.alt}\\Autorizados\\${folderDate[0]}\\${linhas.nf_chave}-procNFe.xml`, 
                        server33: `\\\\172.16.0.33\\Uni\\Uni40\\UniNFe\\${dest.cnpj}\\Enviados\\Autorizados\\${folderDate[0]}\\${linhas.nf_chave}-procNFe.xml`,
                        auto: {
                            key: linhas.nf_chave,
                            file: `${folderDate[1]}/${linhas.nf_chave}-procNFe.xml`
                        }
                    }
                });
            }
            console.log("finalizado");
            res.json({data: datta})
        })
}
//Set NFe data From post (Intranet)
const setNfeDataFromPost = async (req, res) => {
    let data = req.body
    console.log(data);
    //Output if post Variables are empty
    if (data.cnpj === '' || data.nfe === '') return output(res, 0, "Desculpe, os campos: \"Empresa, Emissão e NFe\" são obrigatórios!")
    //Get SQL Statement to Get 'Emitente ID'    
    let sqlEmitente = setSQLEmitenteID()    
    await executeQuery(sqlEmitente, [data.cnpj])
        .then(async ([rows, fields]) => {
            if (rows.length === 0) return output(res, 0, "Desculpe, não foi possível identificar o CNPJ da empresa Emitente!")
            //Get Emitente ID
            console.log(`Pesquisando: ${sqlEmitente}, with vars: ${data.cnpj}`);
            for (const emitente of rows) nfe.emitente = {id: emitente.emi_id, cliente: emitente.emi_nome}
            //Get NFe data
            await getNfeInfos(res, nfe, data)
        })
}
//Export data
module.exports = { setNfeDataFromPost }