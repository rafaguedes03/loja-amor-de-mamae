const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Conexão com o MySQL
const db = mysql.createConnection({
    host: "roundhouse.proxy.rlwy.net",
    port: 45716,
    user: "root",
    password: "jtcorfIYliMpVLsmpJJEqAXpnhnyuRFq",
    database: "railway"
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const routes = require('./routes');
app.use('/', routes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
