const mysql = require("mysql2");
let variables = require("../configs/config.json")
let dados = {}
dados.linhas = []

//SET CONECTIONS
const infos = { 
    host: variables.database.cloudServer.host,
    user: variables.database.cloudServer.username, 
    password: variables.database.cloudServer.password, 
    database: variables.database.cloudServer.scheme, 
    waitForConnections: true 
}
//Create Pool Conections
const connection = mysql.createPool(infos);
//Create Query Conections
const executeQuery = async (sql, values) => {
    const promisePools = connection.promise();
    return await promisePools.query(sql, values)
}
//Build Loopdata from Execute Query
const buildLoopFromQuery = async (linhas) => {
    //Set Datas de Cadastro, Vencimentos e Emissão
    dados.rows = {}
    dados.rows.datas = {}
    dados.rows.datas.cadastro = (!linhas.bol_data_cadastro)? null : linhas.bol_data_cadastro
    dados.rows.datas.vencimento = (!linhas.bol_vencimento)? null : linhas.bol_vencimento
    dados.rows.datas.emissao = (!linhas.nf_emissao)? null : linhas.nf_emissao
    //Dados do Cliente & Documento cadastrado do cliente
    dados.rows.cliente = {}
    dados.rows.cliente.destinatario = (!linhas.bol_destinatario)? null : linhas.bol_destinatario
    dados.rows.cliente.nome = (!linhas.des_nome)? null : linhas.des_nome
    dados.rows.cliente.email = (!linhas.des_email)? null : linhas.des_email
    //(linhas.des_documento.length === 11)? dados.rows.cliente.cpf = linhas.des_documento : dados.rows.cliente.cnpj = linhas.des_documento;
    if (linhas.des_documento.length === 11) dados.rows.cliente.cpf = linhas.des_documento 
    if (linhas.des_documento.length === 14) dados.rows.cliente.cnpj = linhas.des_documento
    if (linhas.des_documento.length !== 11 || linhas.des_documento.length !== 14) dados.rows.cliente.doc = linhas.des_documento
    //Dados de Emissão
    dados.rows.faturas = (!linhas.bol_fatura)? null : linhas.bol_fatura
    dados.rows.nfe = (!linhas.nf_numero)? null : linhas.nf_numero
    dados.rows.valor = (!linhas.nf_valor)? null : linhas.nf_valor
    dados.rows.key = (!linhas.nf_chave)? null : linhas.nf_chave
    //Set Dados linhas
    dados.linhas.push(dados.rows)
}
//Execute Loopdata from SQL Query
const executeLoop = async (rows) => {
    for (const dados in rows) {
        if (Object.hasOwnProperty.call(rows, dados)) {
            const linhas = rows[dados];
            await buildLoopFromQuery(linhas)
        }
    }
    return dados.linhas
}
//SET CONECTIONS
module.exports = { executeQuery, executeLoop };