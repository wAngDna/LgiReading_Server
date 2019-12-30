const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const privateKey = fs.readFileSync('./public/CA_certificate/2446326_codelin.site.key', 'utf8');
const certificate = fs.readFileSync('./public/CA_certificate/2446326_codelin.site.pem', 'utf8');
const options = { key: privateKey, cert: certificate };
const bodyParser = require("body-parser");
const index = require('./router/api/index')
app.use(express.static(__dirname + '/public')); //静态资源
app.use(bodyParser.urlencoded({ extended: false })); //post请求设置
app.use('/api', index);
// const httpServer = http.createServer(function(req, res) {
//     //将http请求重定向问https请求
//     res.writeHead(301, { 'location': 'https://www.codelin.site:8443' });
//     res.end();
// });
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(8443, function() {
//     console.log('HTTPS Server is running ');
// });
// httpServer.listen(8080, function() {
//     console.log("Redirection is ready");
// });
const server = app.listen(8080, function() {
    console.log("Server is Running");
});