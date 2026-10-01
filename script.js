<script>

let listaLivros = [];
let listaAlunos = [];
let listaEmprestimos = [];


/* LOGIN */

function entrar() {

  const usuario =
    document.getElementById('usuario').value.trim();

  const senha =
    document.getElementById('senha').value.trim();

  const mensagem =
    document.getElementById('mensagemLogin');

  mensagem.textContent = '';

  if (!usuario || !senha) {
    mensagem.textContent =
      'Digite o usuário e a senha.';
    return;
  }

  google.script.run
    .withSuccessHandler(function(sucesso) {

      if (sucesso) {

        document
          .getElementById('telaLogin')
          .classList.add('escondido');

        document
          .getElementById('aplicativo')
          .classList.remove('escondido');

        carregarTudo();

      } else {

        mensagem.textContent =
          'Usuário ou senha incorretos.';

      }

    })
    .withFailureHandler(function(erro) {

      mensagem.textContent =
        erro.message || 'Erro ao fazer login.';

    })
    .verificarLogin(usuario, senha);
}


/* SAIR */

function sair() {

  document
    .getElementById('aplicativo')
    .classList.add('escondido');

  document
    .getElementById('telaLogin')
    .classList.remove('escondido');

  document
    .getElementById('usuario')
    .value = '';

  document
    .getElementById('senha')
    .value = '';
}


/* NAVEGAÇÃO */

function mostrarPagina(nome, botao) {

  const paginas = [
    'paginaInicio',
    'paginaLivros',
    'paginaAlunos',
    'paginaEmprestimos'
  ];

  paginas.forEach(function(id) {

    document
      .getElementById(id)
      .classList.add('escondido');

  });

  const paginaSelecionada =
    document.getElementById(
      'pagina' +
      nome.charAt(0).toUpperCase() +
      nome.slice(1)
    );

  if (paginaSelecionada) {
    paginaSelecionada.classList.remove('escondido');
  }

  document
    .querySelectorAll('.menu-item')
    .forEach(function(item) {

      item.classList.remove('ativo');

    });

  if (botao) {
    botao.classList.add('ativo');
  }

  const titulos = {
    inicio: 'Início',
    livros: 'Livros',
    alunos: 'Alunos',
    emprestimos: 'Empréstimos'
  };

  document
    .getElementById('tituloPagina')
    .textContent = titulos[nome] || 'Biblioteca';
}


/* CARREGAMENTO */

function carregarTudo() {

  carregarDashboard();
  carregarLivros();
  carregarAlunos();
  carregarEmprestimos();

}


/* DASHBOARD */

function carregarDashboard() {

  google.script.run
    .withSuccessHandler(function(dados) {

      document
        .getElementById('totalLivros')
        .textContent = dados.totalLivros;

      document
        .getElementById('livrosDisponiveis')
        .textContent = dados.livrosDisponiveis;

      document
        .getElementById('totalAlunos')
        .textContent = dados.totalAlunos;

      document
        .getElementById('emprestimosAtivos')
        .textContent = dados.emprestimosAtivos;

      document
        .getElementById('atrasados')
        .textContent = dados.atrasados;

    })
    .withFailureHandler(mostrarErro)
    .obterDashboard();
}


/* LIVROS */

function carregarLivros() {

  google.script.run
    .withSuccessHandler(function(dados) {

      listaLivros = dados;

      mostrarLivros(listaLivros);
      atualizarSelectLivros();

    })
    .withFailureHandler(mostrarErro)
    .listarLivros();
}


function mostrarLivros(livros) {

  const tabela =
    document.getElementById('tabelaLivros');

  if (!livros.length) {

    tabela.innerHTML =
      '<tr><td colspan="5">Nenhum livro cadastrado.</td></tr>';

    return;
  }

  tabela.innerHTML = livros.map(function(livro) {

    return `
      <tr>
        <td><strong>${escapar(livro.titulo)}</strong></td>
        <td>${escapar(livro.autor)}</td>
        <td>${escapar(livro.genero)}</td>
        <td>${livro.quantidade}</td>
        <td>${livro.disponiveis}</td>
      </tr>
    `;

  }).join('');
}


function filtrarLivros() {

  const texto =
    document
      .getElementById('pesquisaLivros')
      .value
      .toLowerCase();

  const resultado =
    listaLivros.filter(function(livro) {

      return (
        String(livro.titulo)
          .toLowerCase()
          .includes(texto) ||

        String(livro.autor)
          .toLowerCase()
          .includes(texto) ||

        String(livro.genero)
          .toLowerCase()
          .includes(texto)
      );

    });

  mostrarLivros(resultado);
}


function cadastrarLivro() {

  const titulo =
    document.getElementById('livroTitulo').value;

  const autor =
    document.getElementById('livroAutor').value;

  const genero =
    document.getElementById('livroGenero').value;

  const quantidade =
    document.getElementById('livroQuantidade').value;

  google.script.run
    .withSuccessHandler(function(mensagem) {

      fecharModal('modalLivro');

      limparCamposLivro();

      mostrarNotificacao(mensagem);

      carregarTudo();

    })
    .withFailureHandler(mostrarErro)
    .cadastrarLivro(
      titulo,
      autor,
      genero,
      quantidade
    );
}


function limparCamposLivro() {

  document.getElementById('livroTitulo').value = '';
  document.getElementById('livroAutor').value = '';
  document.getElementById('livroGenero').value = '';
  document.getElementById('livroQuantidade').value = '';

}


/* ALUNOS */

function carregarAlunos() {

  google.script.run
    .withSuccessHandler(function(dados) {

      listaAlunos = dados;

      mostrarAlunos(listaAlunos);
      atualizarSelectAlunos();

    })
    .withFailureHandler(mostrarErro)
    .listarAlunos();
}


function mostrarAlunos(alunos) {

  const tabela =
    document.getElementById('tabelaAlunos');

  if (!alunos.length) {

    tabela.innerHTML =
      '<tr><td colspan="3">Nenhum aluno cadastrado.</td></tr>';

    return;
  }

  tabela.innerHTML = alunos.map(function(aluno) {

    return `
      <tr>
        <td><strong>${escapar(aluno.nome)}</strong></td>
        <td>${escapar(aluno.turma)}</td>
        <td>${escapar(aluno.email)}</td>
      </tr>
    `;

  }).join('');
}


function filtrarAlunos() {

  const texto =
    document
      .getElementById('pesquisaAlunos')
      .value
      .toLowerCase();

  const resultado =
    listaAlunos.filter(function(aluno) {

      return (
        String(aluno.nome)
          .toLowerCase()
          .includes(texto) ||

        String(aluno.turma)
          .toLowerCase()
          .includes(texto) ||

        String(aluno.email)
          .toLowerCase()
          .includes(texto)
      );

    });

  mostrarAlunos(resultado);
}


function cadastrarAluno() {

  const nome =
    document.getElementById('alunoNome').value;

  const turma =
    document.getElementById('alunoTurma').value;

  const email =
    document.getElementById('alunoEmail').value;

  google.script.run
    .withSuccessHandler(function(mensagem) {

      fecharModal('modalAluno');

      limparCamposAluno();

      mostrarNotificacao(mensagem);

      carregarTudo();

    })
    .withFailureHandler(mostrarErro)
    .cadastrarAluno(
      nome,
      turma,
      email
    );
}


function limparCamposAluno() {

  document.getElementById('alunoNome').value = '';
  document.getElementById('alunoTurma').value = '';
  document.getElementById('alunoEmail').value = '';

}


/* EMPRÉSTIMOS */

function carregarEmprestimos() {

  google.script.run
    .withSuccessHandler(function(dados) {

      listaEmprestimos = dados;

      mostrarEmprestimos(listaEmprestimos);

    })
    .withFailureHandler(mostrarErro)
    .listarEmprestimos();
}


function mostrarEmprestimos(emprestimos) {

  const tabela =
    document.getElementById('tabelaEmprestimos');

  if (!emprestimos.length) {

    tabela.innerHTML =
      '<tr><td colspan="7">Nenhum empréstimo registrado.</td></tr>';

    return;
  }

  tabela.innerHTML = emprestimos.map(function(item) {

    let classeStatus = 'emprestado';

    if (item.status === 'Atrasado') {
      classeStatus = 'atrasado';
    }

    if (item.status === 'Devolvido') {
      classeStatus = 'devolvido';
    }

    let botao = '';

    if (item.status !== 'Devolvido') {

      botao = `
        <button
          class="botao-devolver"
          onclick="devolverLivro(${item.linha})"
        >
          Devolver
        </button>
      `;

    } else {

      botao = '—';

    }

    return `
      <tr>
        <td>${escapar(item.livro)}</td>
        <td>${escapar(item.aluno)}</td>
        <td>${item.dataEmprestimo}</td>
        <td>${item.dataDevolucao}</td>

        <td>
          <span class="status ${classeStatus}">
            ${item.status}
          </span>
        </td>

        <td>
          R$ ${Number(item.multa).toFixed(2).replace('.', ',')}
        </td>

        <td>
          ${botao}
        </td>
      </tr>
    `;

  }).join('');
}


function filtrarEmprestimos() {

  const texto =
    document
      .getElementById('pesquisaEmprestimos')
      .value
      .toLowerCase();

  const resultado =
    listaEmprestimos.filter(function(item) {

      return (
        String(item.livro)
          .toLowerCase()
          .includes(texto) ||

        String(item.aluno)
          .toLowerCase()
          .includes(texto) ||

        String(item.status)
          .toLowerCase()
          .includes(texto)
      );

    });

  mostrarEmprestimos(resultado);
}


function atualizarSelectLivros() {

  const select =
    document.getElementById('emprestimoLivro');

  const disponiveis =
    listaLivros.filter(function(livro) {

      return Number(livro.disponiveis) > 0;

    });

  if (!disponiveis.length) {

    select.innerHTML =
      '<option value="">Nenhum livro disponível</option>';

    return;
  }

  select.innerHTML =
    '<option value="">Selecione um livro</option>' +

    disponiveis.map(function(livro) {

      return `
        <option value="${escaparAtributo(livro.titulo)}">
          ${escapar(livro.titulo)}
          (${livro.disponiveis} disponível(is))
        </option>
      `;

    }).join('');
}


function atualizarSelectAlunos() {

  const select =
    document.getElementById('emprestimoAluno');

  if (!listaAlunos.length) {

    select.innerHTML =
      '<option value="">Nenhum aluno cadastrado</option>';

    return;
  }

  select.innerHTML =
    '<option value="">Selecione um aluno</option>' +

    listaAlunos.map(function(aluno) {

      return `
        <option value="${escaparAtributo(aluno.nome)}">
          ${escapar(aluno.nome)}
          - ${escapar(aluno.turma)}
        </option>
      `;

    }).join('');
}


function realizarEmprestimo() {

  const livro =
    document.getElementById('emprestimoLivro').value;

  const aluno =
    document.getElementById('emprestimoAluno').value;

  if (!livro || !aluno) {

    mostrarNotificacao(
      'Selecione o livro e o aluno.'
    );

    return;
  }

  google.script.run
    .withSuccessHandler(function(mensagem) {

      fecharModal('modalEmprestimo');

      mostrarNotificacao(mensagem);

      carregarTudo();

    })
    .withFailureHandler(mostrarErro)
    .realizarEmprestimo(
      livro,
      aluno
    );
}


function devolverLivro(linha) {

  const confirmar =
    confirm(
      'Tem certeza que deseja registrar a devolução deste livro?'
    );

  if (!confirmar) {
    return;
  }

  google.script.run
    .withSuccessHandler(function(mensagem) {

      mostrarNotificacao(mensagem);

      carregarTudo();

    })
    .withFailureHandler(mostrarErro)
    .devolverLivro(linha);
}


/* MODAIS */

function abrirModal(id) {

  if (id === 'modalEmprestimo') {

    atualizarSelectLivros();
    atualizarSelectAlunos();

  }

  document
    .getElementById(id)
    .classList.remove('escondido');
}


function fecharModal(id) {

  document
    .getElementById(id)
    .classList.add('escondido');
}


/* NOTIFICAÇÕES */

function mostrarNotificacao(mensagem) {

  const elemento =
    document.getElementById('notificacao');

  elemento.textContent = mensagem;

  elemento.classList.add('mostrar');

  setTimeout(function() {

    elemento.classList.remove('mostrar');

  }, 3000);
}


function mostrarErro(erro) {

  const mensagem =
    erro && erro.message
      ? erro.message
      : 'Ocorreu um erro.';

  mostrarNotificacao(mensagem);
}


/* SEGURANÇA */

function escapar(valor) {

  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function escaparAtributo(valor) {

  return escapar(valor);
}

</script>