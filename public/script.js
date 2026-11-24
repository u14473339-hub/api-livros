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

        formularioLogin.reset();

    } catch (erro) {
        alert('Não foi possível conectar ao servidor.');
    }
});