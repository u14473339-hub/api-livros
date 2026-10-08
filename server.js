const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('api-livros');
const livros = db.collection('livros');
async function iniciarServidor() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB!');

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
        app.listen(3000, () => {
            console.log('Servidor funcionando!');
        });

    } catch (erro) {
        console.error('Erro ao conectar ao MongoDB:', erro);
    }
}

iniciarServidor();