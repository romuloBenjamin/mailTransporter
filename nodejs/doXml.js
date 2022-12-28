//Loud NPM Modules
const express = require("express")
const cors = require("cors")
const url = require("url")
//Loud xml inner Variables
let nfe = {}
nfe.port = "4000"
nfe.date = {}
/* ------------------------------------------------------------------- The Black Box -------------------------------------------------------------------*/
//Loud scripts to run the XML Search
const { setNfeDataFromPost } = require("./_getXml")
//Loud scripts to run MailerSend
//const { setNodeMailerToSend } = require('./_mailler')
/*----------------------------------------------------------------- Start Server Parts -----------------------------------------------------------------*/
//Start Express Program
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({ origin: "*" })); // Run cors middleware
//Get Responser from post data
app.post("/", async (req, res) => await setNfeDataFromPost(req, res))
//app.post("/sendEmailToTransportador", async (req, res) => await setNodeMailerToSend(req, res))
app.listen(nfe.port)