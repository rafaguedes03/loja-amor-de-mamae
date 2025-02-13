const express = require('express');
const router = express.Router();
const db = require('../models/db');


router.get('/', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.get('/clientes', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '..', 'views', 'clientes.html'));
});


// Rota para a página de produtos
router.get('/produtos', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '..', 'views', 'produtos.html'));
});

// Rota para listar produtos
router.get('/api/produtos', async (req, res) => {
    try {
        const [produtos] = await db.query('SELECT * FROM produtos');
        res.json(produtos);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar produtos');
    }
});

// API para cadastrar produtos
router.post('/api/produtos', async (req, res) => {
    const { nome, descricao, preco, quantidade } = req.body;
    await db.query(
        'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque) VALUES (?, ?, ?, ?)',
        [nome, descricao, parseFloat(preco), parseInt(quantidade)]
    );
    res.status(201).send('Produto cadastrado!');
});


// Rota para excluir um produto
router.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM produtos WHERE id = ?', [id]);
        res.send('Produto excluído com sucesso!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir produto');
    }
});

// API para listar clientes
router.get('/api/clientes', async (req, res) => {
    const [clientes] = await db.query('SELECT * FROM clientes');
    res.json(clientes);
});

// Rota para editar um produto
router.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, quantidade } = req.body;

    try {
        await db.query(
            'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ? WHERE id = ?',
            [nome, descricao, preco, quantidade, id]
        );
        res.send('Produto atualizado com sucesso!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar produto');
    }
});

// API para cadastrar clientes
router.post('/api/clientes', async (req, res) => {
    const { nome, telefone, endereco } = req.body;
    await db.query(
        'INSERT INTO clientes (nome, telefone, endereco) VALUES (?, ?, ?)',
        [nome, telefone, endereco]
    );
    res.status(201).send('Cliente cadastrado!');
});

// API para listar vendas
router.get('/api/vendas', async (req, res) => {
    const [vendas] = await db.query(`
        SELECT v.*, c.nome AS cliente_nome
        FROM vendas v
        JOIN clientes c ON v.cliente_id = c.id
    `);
    res.json(vendas);
});

// Rota para a página de vendas
router.get('/vendas', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../views/vendas.html'));
});
// API para registrar vendas
router.post('/api/vendas', async (req, res) => {
    const { clienteId, produtosVenda, formaPagamento, totalVenda } = req.body;

    try {
        // Verificar estoque
        for (const item of produtosVenda) {
            const [produto] = await db.query('SELECT * FROM produtos WHERE id = ?', [item.produtoId]);
            if (produto[0].quantidade_estoque < item.quantidade) {
                return res.status(400).send(`Estoque insuficiente para o produto: ${produto[0].nome}`);
            }
        }

        // Registrar venda
        const [venda] = await db.query(
            'INSERT INTO vendas (cliente_id, total_venda, forma_pagamento) VALUES (?, ?, ?)',
            [clienteId, totalVenda, formaPagamento]
        );

        // Registrar itens da venda
        for (const item of produtosVenda) {
            const [produto] = await db.query('SELECT * FROM produtos WHERE id = ?', [item.produtoId]);
            await db.query(
                'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [venda.insertId, item.produtoId, item.quantidade, produto[0].preco]
            );

            // Atualizar estoque
            await db.query(
                'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
                [item.quantidade, item.produtoId]
            );
        }

        res.status(201).send('Venda registrada!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao registrar venda');
    }
});



// Rota para a página de relatório
router.get('/relatorio', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../views/relatorio.html'));
});

// API para relatório de vendas mensais
router.get('/api/relatorio', async (req, res) => {
    const { mes } = req.query;

    try {
        // Buscar vendas do mês
        const [vendas] = await db.query(`
            SELECT v.*, c.nome AS cliente_nome
            FROM vendas v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE DATE_FORMAT(v.data_venda, '%Y-%m') = ?
        `, [mes]);

        // Calcular o valor total das vendas do mês
        const totalMes = vendas.reduce((total, venda) => total + parseFloat(venda.total_venda), 0);

        // Retornar vendas e valor total
        res.json({ vendas, totalMes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
});

// Rota para editar um cliente
router.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;

    try {
        await db.query(
            'UPDATE clientes SET nome = ?, telefone = ?, endereco = ? WHERE id = ?',
            [nome, telefone, endereco, id]
        );
        res.send('Cliente atualizado com sucesso!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar cliente');
    }
});

// Rota para excluir um cliente
router.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar se o cliente existe
        const [cliente] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
        if (cliente.length === 0) {
            return res.status(404).send('Cliente não encontrado');
        }

        // Excluir o cliente
        await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.send('Cliente excluído com sucesso!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir cliente');
    }
});
// Rota para buscar um produto pelo ID
router.get('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [produto] = await db.query('SELECT * FROM produtos WHERE id = ?', [id]);
        if (produto.length === 0) {
            return res.status(404).send('Produto não encontrado');
        }
        res.json(produto[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar produto');
    }
});

module.exports = router;