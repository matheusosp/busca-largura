import matrizDesafio from './matriz.js';

const direcoes = {
    2: 'U', //cima
    4: 'L', //esquerda
    6: 'R', //direita
    8: 'D'  //baixo
};
const posicoes_vizinhos = [1, 2, 3, 4, 6, 7, 8, 9];
const inicio_relogio = performance.now();
const qtdLarguraMatriz = matrizDesafio[0].length;
const qtdAlturaMatriz = matrizDesafio.length;
const matrizLayout = gerarMatrizLayout(); // matriz com todos os vizinhos de cada posição

let passos = [];
let passos_campeao = [];
let matrizes = [matrizDesafio];
let numeroPassos = 0;
let isDestino = false;
let movimentacoes = getVetorCasaPeao(); // posição inicial

function getVetorCasaPeao() {
    let localizacao_peoes = [[]]
    for (let rowVetor = 0; rowVetor < matrizDesafio.length; rowVetor++) {
        for (let rowCasa = 0; rowCasa < matrizDesafio[rowVetor].length; rowCasa++) {
            if (matrizDesafio[rowVetor][rowCasa] === 3) {
                localizacao_peoes[0].push({ rowVetor: rowVetor, rowCasa: rowCasa })
            }
        }
    }

    return localizacao_peoes;
}
function getValorVizinho(rowCasa, rowVetor, matriz, vizinho) {
    const posicaoVizinho = getPosicaoVizinho(vizinho, rowCasa, rowVetor);
    return matriz[posicaoVizinho.rowVetor][posicaoVizinho.rowCasa];
}

function getPosicaoVizinho(vizinho, rowCasa, rowVetor) {
    switch(vizinho) {
        case 1:
            return {
                rowVetor: rowVetor - 1,
                rowCasa: rowCasa - 1
            };
        case 2:
            return {
                rowVetor: rowVetor - 1,
                rowCasa: rowCasa
            };
        case 3:
            return {
                rowVetor: rowVetor - 1,
                rowCasa: rowCasa + 1
            };
        case 4:
            return {
                rowVetor: rowVetor,
                rowCasa: rowCasa - 1
            };
        case 6:
            return {
                rowVetor: rowVetor,
                rowCasa: rowCasa + 1
            };
        case 7:
            return {
                rowVetor: rowVetor + 1,
                rowCasa: rowCasa - 1
            };
        case 8:
            return {
                rowVetor: rowVetor + 1,
                rowCasa: rowCasa
            };
        case 9:
            return {
                rowVetor: rowVetor + 1,
                rowCasa: rowCasa + 1
            };
        default:
            return null;
    }
}

function isVizinho(rowCasa, rowVetor, matriz, vizinho) {
    return getValorVizinho(rowCasa, rowVetor, matriz, vizinho) === 1;
}

function getVizinhos(rowCasa, rowVetor, matriz) {
    return matrizLayout[rowVetor][rowCasa].map(vizinho => ({
        'posicao': vizinho,
        'isVizinho': isVizinho(rowCasa, rowVetor, matriz, vizinho)
    }));
}

function vizinhosLayout(vizinhos, rowCasa, rowVetor) {
    let vizinhosParaRemover = [];

    // inicio coluna 0 remover diagonal cima esquerda, esquerda, diagonal baixo esquerda
    if (rowCasa === 0) {
        vizinhosParaRemover.push(1, 4, 7);
    } else if (rowCasa === (qtdLarguraMatriz - 1)) { // fim coluna 0 remover diagonal cima direita, direita, diagonal baixo direita
        vizinhosParaRemover.push(3, 6, 9);
    }

    // inicio linha 0 remover diagonal cima esquerda, cima, diagonal cima direita
    if (rowVetor === 0) {
        vizinhosParaRemover.push(1, 2, 3);
    } else if (rowVetor === (qtdAlturaMatriz - 1)) { // fim linha 0 remover diagonal baixo esquerda, baixo, diagonal baixo direita
        vizinhosParaRemover.push(7, 8, 9);
    }

    return vizinhos.filter(vizinho => !vizinhosParaRemover.includes(vizinho));
}

function gerarMatrizLayout() {
    let retornoMatrizLayout = [];
    for (let rowVetor = 0; rowVetor < qtdAlturaMatriz; rowVetor++) {
        let vetor = [];
        for (let rowCasa = 0; rowCasa < qtdLarguraMatriz; rowCasa++) {
            vetor.push(vizinhosLayout(posicoes_vizinhos.slice(), rowCasa, rowVetor));
        }
        retornoMatrizLayout.push(vetor);
    }
    return retornoMatrizLayout;
}

function regras(casa, qtdVizinhos) {
    //posição iniciaç e final desconsidera
    if ([3, 4].includes(casa)) {
        return casa;
    }

    //se a celula esta morta e tem 4 ou 5 vizinhos mortos então a celula fica morta
    if (casa === 1 && [4, 5].includes(qtdVizinhos)) {
        return 1;
    }

    // se a celula esta viva e tem 2 ou 3 ou 4 vizinhos mortos então a celula vira morta
    if (casa === 0 && [2, 3, 4].includes(qtdVizinhos)) {
        return 1;
    }

    return 0;
}

function somaVizinhos(lista) {
    return lista.reduce((soma, item) => item.isVizinho ? soma + 1 : soma, 0);
}

function gerarNovaMatriz(matriz) {
    let novaMatriz = [];
    for (let rowVetor = 0; rowVetor < qtdAlturaMatriz; rowVetor++) {
        let novoVetor = [];
        for (let rowCasa = 0; rowCasa < qtdLarguraMatriz; rowCasa++) {
            let qtdVizinhos = somaVizinhos(getVizinhos(rowCasa, rowVetor, matriz)); // obtem a quatidade de vizinhos mortos da posição
            novoVetor.push(regras(matriz[rowVetor][rowCasa], qtdVizinhos));
        }
        novaMatriz.push(novoVetor);
    }
    return novaMatriz;
}

function calcularMatriz() {
    let matriz = matrizDesafio;

    do {
        matriz = gerarNovaMatriz(matriz);
        calcularRota(matriz);
        matrizes.push(matriz);
    } while (!isDestino)

    gerarPassos();

    console.log(`Tempo decorrido: ${performance.now() - inicio_relogio} ms`);
}

function calcularRota(matriz) {
    let localizacaoPeoes = movimentacoes[numeroPassos];

    //itera em todas as movimentações de um passo e obtem todas as novas movimentações para essas movimentações ja existentes
    for (let i = 0; i < localizacaoPeoes.length; i++) {
        let localizacaoPeao = localizacaoPeoes[i];
        let vizinhos = getVizinhos(localizacaoPeao['rowCasa'], localizacaoPeao['rowVetor'], matriz);
        // faz um filtro para obter somente os vizinhos que não estão mortos e que não são diagonais
        let vizinhosLivres = vizinhos.filter(x => !x["isVizinho"] && [2, 4, 6, 8].includes(x["posicao"])); 

        movimentar(vizinhosLivres, localizacaoPeao, matriz);
    }
    numeroPassos++;
}

function gerarPassos() {
    let movimentacaoReverso = movimentacoes.slice().reverse();
    let movimentoAtual = {};

    for (let count = 0; count < movimentacaoReverso.length; count++) {
        let movimentacao = movimentacaoReverso[count];

        // busca o caminho que contem o nó objetivo para a partir dele obter o caminho até o passo inicial
        if (count === 0) {
            movimentoAtual = movimentacao.filter(movimento => movimento.casaAtual === 4)[0];
            passos.push(movimentoAtual['passo']);
            passos_campeao.push(movimentoAtual);
            continue;
        }

        let movimentacaoAnterior = movimentacao.filter(x => x["rowVetor"] === movimentoAtual['rowVetorAnterior'] && x["rowCasa"] === movimentoAtual['rowCasaAnterior'])[0];
        movimentoAtual = {
            ...movimentacaoAnterior
        };

        passos_campeao.push(movimentoAtual);

        if (!movimentacaoAnterior['passo']) {
            continue;
        }

        passos.push(movimentacaoAnterior['passo']);
    }

    passos = passos.reverse();
    passos_campeao = passos_campeao.reverse();

    console.log("Quantidade passos: " + passos.length);
    console.log("Passos: " + passos.join(' '));
}

function movimentar(vizinhosLivres, localizacaoPeao, matriz) {
    if (vizinhosLivres.length === 0) {
        return;
    }

    for (let vizinho of vizinhosLivres) {
        let posicao = getPosicaoVizinho(vizinho.posicao, localizacaoPeao.rowCasa, localizacaoPeao.rowVetor); // obtem x e y  do vizinho
        let has_repetido = false;

        if (movimentacoes.length <= (numeroPassos + 1)) {
            movimentacoes.push([]);
        } else {
            has_repetido = movimentacoes[numeroPassos + 1].filter(x => x.rowVetor === posicao.rowVetor && x.rowCasa === posicao.rowCasa).length > 0;
        }

        let casa = matriz[posicao.rowVetor][posicao.rowCasa];

        if (!has_repetido && casa !== 3) {
            let movimento = {
                rowVetor: posicao.rowVetor,
                rowCasa: posicao.rowCasa,
                passo: direcoes[vizinho.posicao],
                rowVetorAnterior: localizacaoPeao.rowVetor,
                rowCasaAnterior: localizacaoPeao.rowCasa,
                casaAtual: casa
            };

            movimentacoes[numeroPassos + 1].push(movimento);

            if (casa === 4) {
                isDestino = true;
            }
        }
    }
}

calcularMatriz();

export {
    matrizes,
    qtdLarguraMatriz,
    qtdAlturaMatriz,
    movimentacoes,
    passos_campeao
};