const telaLogin = document.getElementById('tela-login');
const telaCadastro = document.getElementById('tela-cadastro');

const botaoCadastro = document.getElementById('mostrar-cadastro');
const botaoVoltar = document.getElementById('voltar-login');

botaoCadastro.addEventListener('click', function() {
    telaLogin.hidden = true;
    telaCadastro.hidden = false;
});

botaoVoltar.addEventListener('click', function() {
    telaCadastro.hidden = true;
    telaLogin.hidden = false;
});

const formularioCadastro = document.getElementById('form-cadastro');

formularioCadastro.addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    const senha = document.getElementById('senha-cadastro').value;

    try {
        const resposta = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao cadastrar usuário.');
            return;
        }

        alert('Cadastro realizado com sucesso!');

        formularioCadastro.reset();

        telaCadastro.hidden = true;
        telaLogin.hidden = false;

    } catch (erro) {
        alert('Não foi possível conectar ao servidor.');
    }
});

const formularioLogin = document.getElementById('form-login');

formularioLogin.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;

    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || 'Erro ao realizar login.');
            return;
        }

        sessionStorage.setItem('token', dados.token);

        telaLogin.hidden = true;
        telaCadastro.hidden = true;
        document.getElementById('tela-biblioteca').hidden = false;
carregarLivros();
        formularioLogin.reset();

    } catch (erro) {
        alert('Não foi possível conectar ao servidor.');
    }
});

async function carregarLivros() {
    const token = sessionStorage.getItem('token');

    try {
        const resposta = await fetch('/livros', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const livros = await resposta.json();

        if (!resposta.ok) {
            alert('Erro ao carregar os livros.');
            return;
        }

        const listaLivros = document.getElementById('lista-livros');

        listaLivros.innerHTML = '';

        livros.forEach(function(livro) {
    const item = document.createElement('div');

    const titulo = document.createElement('h3');
    titulo.textContent = livro.titulo;

    const autor = document.createElement('p');
    autor.textContent = `Autor: ${livro.autor}`;

    const genero = document.createElement('p');
    genero.textContent = `Gênero: ${livro.genero}`;

    const paginas = document.createElement('p');
    paginas.textContent = `Páginas: ${livro.numeroDePaginas}`;

const botaoEditar = document.createElement('button');
botaoEditar.textContent = 'Editar';

botaoEditar.addEventListener('click', async function() {
    const novoTitulo = prompt('Novo título:', livro.titulo);

    if (novoTitulo === null || novoTitulo.trim() === '') {
        return;
    }

    const novoAutor = prompt('Novo autor:', livro.autor);

    if (novoAutor === null || novoAutor.trim() === '') {
        return;
    }

    const novoGenero = prompt('Novo gênero:', livro.genero);

    if (novoGenero === null || novoGenero.trim() === '') {
        return;
    }

    const novasPaginas = prompt('Novo número de páginas:', livro.numeroDePaginas);

    if (novasPaginas === null || Number(novasPaginas) < 1 || !Number.isInteger(Number(novasPaginas))) {
        alert('Informe um número de páginas válido.');
        return;
    }

    const resposta = await fetch(`/livros/${livro._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
            titulo: novoTitulo.trim(),
            autor: novoAutor.trim(),
            genero: novoGenero.trim(),
            numeroDePaginas: Number(novasPaginas)
        })
    });

    if (!resposta.ok) {
        alert('Erro ao editar livro.');
        return;
    }

    alert('Livro atualizado com sucesso!');
    carregarLivros();
});


    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';

    botaoExcluir.addEventListener('click', async function() {
        const confirmar = confirm(`Deseja excluir "${livro.titulo}"?`);

        if (!confirmar) {
            return;
        }

        const resposta = await fetch(`/livros/${livro._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!resposta.ok) {
            alert('Erro ao excluir livro.');
            return;
        }

        alert('Livro excluído com sucesso!');
        carregarLivros();
    });

    item.appendChild(titulo);
    item.appendChild(autor);
    item.appendChild(genero);
    item.appendChild(paginas);
    item.appendChild(botaoEditar);
    item.appendChild(botaoExcluir);

    listaLivros.appendChild(item);
});

    } catch (erro) {
        alert('Não foi possível carregar os livros.');
    }
}

const formularioLivro = document.getElementById('form-livro');

formularioLivro.addEventListener('submit', async function(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const genero = document.getElementById('genero').value;
    const numeroDePaginas = Number(document.getElementById('paginas').value);

    const token = sessionStorage.getItem('token');

    try {
        const resposta = await fetch('/livros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo,
                autor,
                genero,
                numeroDePaginas
            })
        });

        if (!resposta.ok) {
            alert('Erro ao adicionar livro.');
            return;
        }

        alert('Livro adicionado com sucesso!');

        formularioLivro.reset();

        carregarLivros();

    } catch (erro) {
        alert('Não foi possível conectar ao servidor.');
    }
});

const botaoSair = document.getElementById('btn-sair');

botaoSair.addEventListener('click', function() {
    sessionStorage.removeItem('token');

    document.getElementById('tela-biblioteca').hidden = true;
    telaCadastro.hidden = true;
    telaLogin.hidden = false;
});