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
function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensagem: 'Token não fornecido.'
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
        if (erro) {
            return res.status(403).json({
                mensagem: 'Token inválido ou expirado.'
            });
        }

        req.usuario = usuario;
        next();
    });
}
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
 app.get('/livros', autenticarToken, async (req, res) => {
    const resultado = await livros.find().toArray();

    res.json(resultado);
});
        
        app.get('/usuarios', async (req, res) => {
            try {
                const resultado = await usuarios.find(
                    {},
                    { projection: { senha: 0 } }
                ).toArray();

                res.json(resultado);

            } catch (erro) {
                console.error(erro);
                res.status(500).json({
                    mensagem: 'Erro ao listar usuários.'
                });
            }
        });

        app.put('/usuarios/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const { nome, email } = req.body;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({
                        mensagem: 'ID inválido.'
                    });
                }

                if (!nome && !email) {
                    return res.status(400).json({
                        mensagem: 'Informe o nome ou o email para atualizar.'
                    });
                }

                const resultado = await usuarios.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { ...(nome && { nome }), ...(email && { email }) } }
                );

                if (resultado.matchedCount === 0) {
                    return res.status(404).json({
                        mensagem: 'Usuário não encontrado.'
                    });
                }

                res.json({
                    mensagem: 'Usuário atualizado com sucesso!'
                });

            } catch (erro) {
                console.error(erro);

                if (erro.code === 11000) {
                    return res.status(409).json({
                        mensagem: 'Este email já está cadastrado.'
                    });
                }

                res.status(500).json({
                    mensagem: 'Erro ao atualizar usuário.'
                });
            }
        });
         app.delete('/usuarios/:id', async (req, res) => {
            try {
                const id = req.params.id;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({
                        mensagem: 'ID inválido.'
                    });
                }

                const resultado = await usuarios.deleteOne({
                    _id: new ObjectId(id)
                });

                if (resultado.deletedCount === 0) {
                    return res.status(404).json({
                        mensagem: 'Usuário não encontrado.'
                    });
                }

                res.json({
                    mensagem: 'Usuário excluído com sucesso!'
                });

            } catch (erro) {
                console.error(erro);
                res.status(500).json({
                    mensagem: 'Erro ao excluir usuário.'
                });
            }
        });
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Informe email e senha.'
            });
        }

        const usuario = await usuarios.findOne({ email });

        if (!usuario) {
            return res.status(401).json({
                mensagem: 'Email ou senha incorretos.'
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'Email ou senha incorretos.'
            });
        }

        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            mensagem: 'Login realizado com sucesso!',
            token
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao realizar login.'
        });
    }
});

     


       app.post('/livros', autenticarToken, async (req, res) => {
    const novoLivro = req.body;

    const resultado = await livros.insertOne(novoLivro);

    res.json(resultado);
});
 app.put('/livros/:id',autenticarToken, async (req, res) =>
{    const id = req.params.id;
    const novosDados = req.body;

    const resultado = await livros.updateOne(
        { _id: new ObjectId(id) },
        { $set: novosDados }
    );

    res.json(resultado);
});

app.delete('/livros/:id', autenticarToken, async (req, res) => {
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