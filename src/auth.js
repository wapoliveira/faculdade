const jwt = require('jsonwebtoken');

const secretKey = 'alexandromeuheroi';

function gerarToken(usuarioId) {
    const token = jwt.sign({ id: usuarioId }, secretKey, { expiresIn: '1h' });
    return token;
}

function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.usuarioId = decoded.id;
        next();
    });
}

module.exports = { gerarToken, verificarToken, secretKey };
