const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const conn = require("./bd")

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

const functionRoutes = require('./function');
app.use('/', functionRoutes);



app.listen(5000, function (){
    console.log('Api contato esta rodando na porta 5000!')
})

/*app.get('/', function (req, res){
    conn.query('SELECT * FROM tbContato',
    function (err, results, filds) {
        res.status(200).json(results)
    })
    conn.end(
        function (err) {
            if (err) throw err;
            else console.log('Closing connection.')
    });
})

app.post('/', function(req, res) {
    const { nome, sobrenome, telefone, email } = req.body;
    conn.query('INSERT INTO tbcontato (nome, sobrenome, telefone, email) values (?,?,?,?)', [nome, sobrenome, telefone, email], function (error, results) {
        if (error) throw error;
        res.status(200).json(results)
    });
    conn.end(
        function (err) {
            if (err) throw err;
            else console.log('Closing connection.')
        });
})

app.put('/', function(req, res) {
    const { id, nome, telefone, email } = req.body;
    conn.query('UPDATE tbcontato set nome = ?, sobrenome = ?, email = ? where id = ?', [nome, sobrenome, telefone, email, id], function (error, results) {
        if (error) throw error;
        res.status(200).json(results)
    });
    conn.end(
        function (err) {
            if (err) throw err;
            else console.log('Clossing connection.')
        });
})

app.delete('/', function(req, res) {
    const { id } = req.body;
    conn.query('DELETE FROM tbcontato where id = ?', [id], function (error, results) {
        if (error) throw error;
        res.status(200).json(results)
    });
    conn.end(
        function (err) {
            if (err) throw err;
            else console.log('Clossing connection.')
        });
})*/