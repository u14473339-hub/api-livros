const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('api-livros');
const livros = db.collection('livros');
const usuarios = db.collection('usuarios');
async function iniciarServidor() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB!');

        app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: 'Preencha nome, email e senha.'
            });
        }

        const usuarioExistente = await usuarios.findOne({ email });

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: 'Este email já está cadastrado.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = {
            nome,
            email,
            senha: senhaHash
        };

        const resultado = await usuarios.insertOne(novoUsuario);

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertedId,
            nome,
            email
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });
    }
});

        app.get('/livros', async (req, res) => {
    const resultado = await livros.find().toArray();

    res.json(resultado);
});

        app.post('/livros', async (req, res) => {
    const novoLivro = req.body;

    const resultado = await livros.insertOne(novoLivro);

    res.json(resultado);
});
 app.put('/livros/:id', async (req, res) => {
    const id = req.params.id;
    const novosDados = req.body;

    const resultado = await livros.updateOne(
        { _id: new ObjectId(id) },
        { $set: novosDados }
    );

    res.json(resultado);
});

app.delete('/livros/:id', async (req, res) => {
    const id = req.params.id;

    const resultado = await livros.deleteOne(
        { _id: new ObjectId(id) }
    );

    res.json(resultado);
});
        app.listen(3000, () => {
            console.log('Servidor funcionando!');
        });

    } catch (erro) {
        console.error('Erro ao conectar ao MongoDB:', erro);
    }
}

iniciarServidor();