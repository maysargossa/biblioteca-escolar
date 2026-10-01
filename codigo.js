const NOME_ABA_LIVROS = 'Livros';
const NOME_ABA_ALUNOS = 'Alunos';
const NOME_ABA_EMPRESTIMOS = 'Emprestimos';

const PRAZO_EMPRESTIMO = 7;
const MULTA_POR_DIA = 2;

function doGet() {
  configurarPlanilhas();

  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle('Biblioteca Escolar')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function incluirArquivo(nome) {
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}

function configurarPlanilhas() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let livros = planilha.getSheetByName(NOME_ABA_LIVROS);
  let alunos = planilha.getSheetByName(NOME_ABA_ALUNOS);
  let emprestimos = planilha.getSheetByName(NOME_ABA_EMPRESTIMOS);

  if (!livros) {
    livros = planilha.insertSheet(NOME_ABA_LIVROS);
  }

  if (!alunos) {
    alunos = planilha.insertSheet(NOME_ABA_ALUNOS);
  }

  if (!emprestimos) {
    emprestimos = planilha.insertSheet(NOME_ABA_EMPRESTIMOS);
  }

  configurarCabecalho(
    livros,
    ['Data', 'Título', 'Autor', 'Gênero', 'Quantidade', 'Disponíveis']
  );

  configurarCabecalho(
    alunos,
    ['Data', 'Nome', 'Turma', 'E-mail']
  );

  configurarCabecalho(
    emprestimos,
    [
      'Data',
      'Livro',
      'Aluno',
      'Data empréstimo',
      'Data devolução',
      'Status'
    ]
  );

  formatarPlanilha(livros);
  formatarPlanilha(alunos);
  formatarPlanilha(emprestimos);
}

function configurarCabecalho(aba, cabecalhos) {
  const primeiraLinha = aba.getRange(
    1,
    1,
    1,
    cabecalhos.length
  ).getValues()[0];

  const precisaCriar =
    primeiraLinha.every(function(valor) {
      return valor === '';
    });

  if (precisaCriar) {
    aba.getRange(
      1,
      1,
      1,
      cabecalhos.length
    ).setValues([cabecalhos]);
  }
}

function formatarPlanilha(aba) {
  aba.setFrozenRows(1);

  const ultimaColuna = aba.getLastColumn();

  if (ultimaColuna > 0) {
    aba.getRange(
      1,
      1,
      1,
      ultimaColuna
    ).setFontWeight('bold');

    aba.autoResizeColumns(
      1,
      ultimaColuna
    );
  }
}

function verificarLogin(usuario, senha) {
  return usuario === 'admin' && senha === '1234';
}

function obterDashboard() {
  configurarPlanilhas();

  const livros = listarLivros();
  const alunos = listarAlunos();
  const emprestimos = listarEmprestimos();

  let totalLivros = 0;
  let livrosDisponiveis = 0;

  livros.forEach(function(livro) {
    totalLivros += Number(livro.quantidade) || 0;
    livrosDisponiveis += Number(livro.disponiveis) || 0;
  });

  let emprestimosAtivos = 0;
  let atrasados = 0;

  emprestimos.forEach(function(emprestimo) {
    if (emprestimo.status !== 'Devolvido') {
      emprestimosAtivos++;

      if (emprestimo.status === 'Atrasado') {
        atrasados++;
      }
    }
  });

  return {
    totalLivros: totalLivros,
    livrosDisponiveis: livrosDisponiveis,
    totalAlunos: alunos.length,
    emprestimosAtivos: emprestimosAtivos,
    atrasados: atrasados
  };
}

function cadastrarLivro(titulo, autor, genero, quantidade) {
  configurarPlanilhas();

  titulo = String(titulo || '').trim();
  autor = String(autor || '').trim();
  genero = String(genero || '').trim();
  quantidade = Number(quantidade);

  if (!titulo) {
    throw new Error('Digite o título do livro.');
  }

  if (!autor) {
    throw new Error('Digite o autor do livro.');
  }

  if (!genero) {
    throw new Error('Digite o gênero do livro.');
  }

  if (!quantidade || quantidade < 1) {
    throw new Error('A quantidade deve ser maior que zero.');
  }

  const aba = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOME_ABA_LIVROS);

  const livros = aba.getDataRange().getValues();

  for (let i = 1; i < livros.length; i++) {
    const tituloExistente = String(livros[i][1] || '')
      .trim()
      .toLowerCase();

    if (tituloExistente === titulo.toLowerCase()) {
      throw new Error('Esse livro já está cadastrado.');
    }
  }

  aba.appendRow([
    new Date(),
    titulo,
    autor,
    genero,
    quantidade,
    quantidade
  ]);

  return 'Livro cadastrado com sucesso!';
}

function listarLivros() {
  configurarPlanilhas();

  const aba = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOME_ABA_LIVROS);

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados = aba
    .getRange(2, 1, ultimaLinha - 1, 6)
    .getValues();

  return dados.map(function(linha, indice) {
    return {
      linha: indice + 2,
      data: formatarData(linha[0]),
      titulo: linha[1],
      autor: linha[2],
      genero: linha[3],
      quantidade: Number(linha[4]) || 0,
      disponiveis: Number(linha[5]) || 0
    };
  });
}

function cadastrarAluno(nome, turma, email) {
  configurarPlanilhas();

  nome = String(nome || '').trim();
  turma = String(turma || '').trim();
  email = String(email || '').trim();

  if (!nome) {
    throw new Error('Digite o nome do aluno.');
  }

  if (!turma) {
    throw new Error('Digite a turma.');
  }

  if (!email) {
    throw new Error('Digite o e-mail.');
  }

  const aba = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOME_ABA_ALUNOS);

  const alunos = aba.getDataRange().getValues();

  for (let i = 1; i < alunos.length; i++) {
    const nomeExistente = String(alunos[i][1] || '')
      .trim()
      .toLowerCase();

    if (nomeExistente === nome.toLowerCase()) {
      throw new Error('Esse aluno já está cadastrado.');
    }
  }

  aba.appendRow([
    new Date(),
    nome,
    turma,
    email
  ]);

  return 'Aluno cadastrado com sucesso!';
}

function listarAlunos() {
  configurarPlanilhas();

  const aba = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOME_ABA_ALUNOS);

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados = aba
    .getRange(2, 1, ultimaLinha - 1, 4)
    .getValues();

  return dados.map(function(linha, indice) {
    return {
      linha: indice + 2,
      data: formatarData(linha[0]),
      nome: linha[1],
      turma: linha[2],
      email: linha[3]
    };
  });
}

function realizarEmprestimo(tituloLivro, nomeAluno) {
  configurarPlanilhas();

  tituloLivro = String(tituloLivro || '').trim();
  nomeAluno = String(nomeAluno || '').trim();

  if (!tituloLivro || !nomeAluno) {
    throw new Error('Selecione o livro e o aluno.');
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  const abaLivros = planilha.getSheetByName(NOME_ABA_LIVROS);
  const abaAlunos = planilha.getSheetByName(NOME_ABA_ALUNOS);
  const abaEmprestimos = planilha.getSheetByName(NOME_ABA_EMPRESTIMOS);

  const livros = abaLivros.getDataRange().getValues();
  const alunos = abaAlunos.getDataRange().getValues();

  let livroEncontrado = -1;
  let alunoEncontrado = -1;

  for (let i = 1; i < livros.length; i++) {
    if (
      String(livros[i][1]).trim().toLowerCase() ===
      tituloLivro.toLowerCase()
    ) {
      livroEncontrado = i;
      break;
    }
  }

  for (let i = 1; i < alunos.length; i++) {
    if (
      String(alunos[i][1]).trim().toLowerCase() ===
      nomeAluno.toLowerCase()
    ) {
      alunoEncontrado = i;
      break;
    }
  }

  if (livroEncontrado === -1) {
    throw new Error('Livro não encontrado.');
  }

  if (alunoEncontrado === -1) {
    throw new Error('Aluno não encontrado.');
  }

  const disponiveis =
    Number(livros[livroEncontrado][5]) || 0;

  if (disponiveis <= 0) {
    throw new Error('Esse livro não está disponível.');
  }

  const dataEmprestimo = new Date();

  const dataDevolucao = new Date(dataEmprestimo);

  dataDevolucao.setDate(
    dataDevolucao.getDate() + PRAZO_EMPRESTIMO
  );

  abaEmprestimos.appendRow([
    new Date(),
    livros[livroEncontrado][1],
    alunos[alunoEncontrado][1],
    dataEmprestimo,
    dataDevolucao,
    'Emprestado'
  ]);

  const novaDisponibilidade = disponiveis - 1;

  abaLivros
    .getRange(livroEncontrado + 1, 6)
    .setValue(novaDisponibilidade);

  return 'Empréstimo realizado com sucesso!';
}

function listarEmprestimos() {
  configurarPlanilhas();

  const aba = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(NOME_ABA_EMPRESTIMOS);

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados = aba
    .getRange(2, 1, ultimaLinha - 1, 6)
    .getValues();

  const hoje = new Date();

  return dados.map(function(linha, indice) {
    let status = linha[5];

    if (status !== 'Devolvido') {
      const dataDevolucao = linha[4];

      if (
        dataDevolucao instanceof Date &&
        dataDevolucao < hoje
      ) {
        status = 'Atrasado';
      } else {
        status = 'Emprestado';
      }
    }

    return {
      linha: indice + 2,
      data: formatarData(linha[0]),
      livro: linha[1],
      aluno: linha[2],
      dataEmprestimo: formatarData(linha[3]),
      dataDevolucao: formatarData(linha[4]),
      status: status,
      multa: calcularMulta(linha[4], status)
    };
  });
}

function devolverLivro(linhaEmprestimo) {
  configurarPlanilhas();

  linhaEmprestimo = Number(linhaEmprestimo);

  if (!linhaEmprestimo || linhaEmprestimo < 2) {
    throw new Error('Empréstimo inválido.');
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  const abaEmprestimos =
    planilha.getSheetByName(NOME_ABA_EMPRESTIMOS);

  const abaLivros =
    planilha.getSheetByName(NOME_ABA_LIVROS);

  const dadosEmprestimo =
    abaEmprestimos
      .getRange(linhaEmprestimo, 1, 1, 6)
      .getValues()[0];

  if (!dadosEmprestimo[1]) {
    throw new Error('Empréstimo não encontrado.');
  }

  if (dadosEmprestimo[5] === 'Devolvido') {
    throw new Error('Esse livro já foi devolvido.');
  }

  const tituloLivro = String(dadosEmprestimo[1]);

  const livros = abaLivros.getDataRange().getValues();

  let livroEncontrado = -1;

  for (let i = 1; i < livros.length; i++) {
    if (
      String(livros[i][1]).trim().toLowerCase() ===
      tituloLivro.trim().toLowerCase()
    ) {
      livroEncontrado = i;
      break;
    }
  }

  if (livroEncontrado === -1) {
    throw new Error('Livro não encontrado na aba Livros.');
  }

  const disponiveis =
    Number(livros[livroEncontrado][5]) || 0;

  const quantidade =
    Number(livros[livroEncontrado][4]) || 0;

  const novaDisponibilidade =
    Math.min(disponiveis + 1, quantidade);

  abaLivros
    .getRange(livroEncontrado + 1, 6)
    .setValue(novaDisponibilidade);

  abaEmprestimos
    .getRange(linhaEmprestimo, 5)
    .setValue(new Date());

  abaEmprestimos
    .getRange(linhaEmprestimo, 6)
    .setValue('Devolvido');

  return 'Livro devolvido com sucesso!';
}

function calcularMulta(dataDevolucao, status) {
  if (status === 'Devolvido') {
    return 0;
  }

  if (!(dataDevolucao instanceof Date)) {
    return 0;
  }

  const hoje = new Date();

  if (dataDevolucao >= hoje) {
    return 0;
  }

  const diferenca =
    hoje.getTime() - dataDevolucao.getTime();

  const diasAtrasados =
    Math.ceil(diferenca / (1000 * 60 * 60 * 24));

  return diasAtrasados * MULTA_POR_DIA;
}

function formatarData(data) {
  if (!(data instanceof Date)) {
    return data || '';
  }

  return Utilities.formatDate(
    data,
    Session.getScriptTimeZone(),
    'dd/MM/yyyy'
  );
}