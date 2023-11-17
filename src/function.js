const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { gerarToken, verificarToken, secretKey } = require('./auth');
const conn = require('./bd.js');

router.post('/login', (req, res) => {
    const {email, senha} = req.body;
    if (email === 'wellington@fag.edu.br' && senha === 'well1234') {
        const token = jwt.sign( {email}, secretKey, {
            expiresIn: 60000,
        });
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas'});
    }
});


router.post('/gerar-token', (req, res) => {
    const usuarioId = req.usuarioId;
    const token = gerarToken(usuarioId);

    res.status(200).json({ token });
});


router.post('/cadastrar-cliente', verificarToken, (req, res) => {
    const { nome, telefone, email, endereco } = req.body;
    const sql = 'INSERT INTO clientes (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)';
    conn.query(sql, [nome, telefone, email, endereco], (error, results) => {
        if (error) throw error;
        res.status(201).json({ message: 'Cliente cadastrado com sucesso', id: results.insertId });
    });
});


router.post('/cadastrar-funcionario', verificarToken, (req, res) => {
    const { nome, cargo, salario } = req.body;
    const sql = 'INSERT INTO funcionarios (nome, cargo, salario) VALUES (?, ?, ?)';
    conn.query(sql, [nome, cargo, salario], (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            res.status(500).json({ message: 'Erro interno ao cadastrar funcionário' });
        } else {
            console.log('Funcionário cadastrado com sucesso. ID:', results.insertId);
            res.status(201).json({ message: 'Funcionário cadastrado com sucesso', id: results.insertId });
        }
    });
});


router.post('/cadastrar-produto', verificarToken, (req, res) => {
    const { nome, preco, descricao } = req.body;
    const sql = 'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)';
    conn.query(sql, [nome, preco, descricao], (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar produto:', error);
            res.status(500).json({ message: 'Erro interno ao cadastrar produto' });
        } else {
            console.log('Produto cadastrado com sucesso. ID:', results.insertId);
            res.status(201).json({ message: 'Produto cadastrado com sucesso', id: results.insertId });
        }
    });
});


router.get('/listar-produtos', (req, res) => {
    const sql = 'SELECT * FROM produtos';
    conn.query(sql, (error, results) => {
        if (error) {
            console.error('Erro ao listar produtos:', error);
            res.status(500).json({ message: 'Erro interno ao listar produtos' });
        } else {
            console.log('Produtos listados com sucesso.');
            res.status(200).json(results);
        }
    });
});


router.post('/adicionar-item-pedido', verificarToken, (req, res) => {
    const { pedido_id, produto_id, quantidade } = req.body;
    const sql = 'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade) VALUES (?, ?, ?)';
    conn.query(sql, [pedido_id, produto_id, quantidade], (error, results) => {
        if (error) {
            console.error('Erro ao adicionar item em um pedido:', error);
            res.status(500).json({ message: 'Erro interno ao adicionar item em um pedido' });
        } else {
            console.log('Item adicionado em um pedido com sucesso. ID:', results.insertId);
            res.status(201).json({ message: 'Item adicionado em um pedido com sucesso', id: results.insertId });
        }
    });
});


router.put('/fechar-pedido/', verificarToken, (req, res) => {
    const { pedido_id, numero_pessoas, valorTotal } = req.body;
    
    
    const updatePedidoSql = 'UPDATE pedidos SET status = "Fechado" WHERE id = ?';
    
    conn.query(updatePedidoSql, [pedido_id], (errorPedido, resultsPedido) => {
        if (errorPedido) {
            console.error('Erro ao fechar pedido:', errorPedido);
            res.status(500).json({ message: 'Erro interno ao fechar pedido' });
        } else {
            
            const valorTotalSql = 'SELECT SUM(preco * quantidade) AS total FROM produtos ' +
                                'INNER JOIN itens_pedido ON produtos.id = itens_pedido.produto_id ' +
                                'WHERE itens_pedido.pedido_id = ?';
            
            conn.query(valorTotalSql, [pedido_id], (errorValorTotal, resultsValorTotal) => {
                if (errorValorTotal) {
                    console.error('Erro ao calcular valor total:', errorValorTotal);
                    res.status(500).json({ message: 'Erro interno ao calcular valor total' });
                } else {
                    const valorTotal = resultsValorTotal[0].total;
                    const insertContaSql = 'INSERT INTO contas (pedido_id, numero_pessoas, valor_total) VALUES (?, ?, ?)';
                    
                    conn.query(insertContaSql, [pedido_id, numero_pessoas, valorTotal], (errorConta, resultsConta) => {
                        if (errorConta) {
                            console.error('Erro ao inserir conta:', errorConta);
                            res.status(500).json({ message: 'Erro interno ao inserir conta' + errorConta });
                        } else {
                            console.log('Pedido fechado com sucesso. ID do Pedido:', pedido_id);
                            res.status(200).json({ message: 'Pedido fechado com sucesso' });
                        }
                    });
                }
            });
        }
    });
});


router.get('/relatorio-cozinha/:pedido_id', verificarToken, (req, res) => {
    const pedido_id = req.params.pedido_id;
    
    const sql = 'SELECT p.nome AS nome_produto, ip.quantidade, rc.descricao ' +
                'FROM itens_pedido ip ' +
                'INNER JOIN produtos p ON ip.produto_id = p.id ' +
                'LEFT JOIN relatorio_cozinha rc ON ip.id = rc.pedido_id ' +
                'WHERE ip.pedido_id = ?';
    
    conn.query(sql, [pedido_id], (error, results) => {
        if (error) {
            console.error('Erro ao gerar relatório de produção:', error);
            res.status(500).json({ message: 'Erro interno ao gerar relatório de produção' });
        } else {
            console.log('Relatório de produção gerado com sucesso.');
            res.status(200).json(results);
        }
    });
});


module.exports = router;