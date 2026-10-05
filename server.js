const express = require('express');

const app = express();

app.get('/livros', (req, res) => {
    res.send('Lista de livros');
});

app.listen(3000, () => {
    console.log('Servidor funcionando!');
});