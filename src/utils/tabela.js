import { paraNumero } from './exportar'

export const texto = (v) => (v === undefined || v === null ? '' : String(v))

// Sem espaços sobrando e sem diferença entre maiúscula e minúscula.
export const normalizar = (v) => texto(v).trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR')

// Completa a linha com células vazias até ter n colunas.
export const preencher = (r, n) => (r.length >= n ? r : [...r, ...Array(n - r.length).fill('')])

// Números inteiros muito grandes (EAN) vão como texto para o Excel não usar notação científica.
export const seguroParaExcel = (v) =>
  typeof v === 'number' && Number.isInteger(v) && Math.abs(v) >= 1e11 ? String(v) : v

// Conteúdo da coluna apontada: é o que identifica o produto (ex.: o código).
export function chaveLinha(linha, col, porId) {
  const alvo = porId[col.chave]
  return alvo && alvo.tipo === 'dado' ? texto(linha.cells[alvo.origem]).trim() : ''
}

// Valor mostrado numa célula: dado da planilha ou valor digitado (preço/observação).
export function valorCelula(linha, col, porId, valores) {
  if (col.tipo === 'dado') return linha.cells[col.origem] ?? ''
  const chave = chaveLinha(linha, col, porId)
  return chave ? (valores[col.id]?.[chave] ?? '') : ''
}

// Compara como número quando os dois forem números; senão, como texto.
export function compararValores(a, b) {
  const x = paraNumero(a)
  const y = paraNumero(b)
  if (x !== '' && y !== '') return x - y
  return texto(a).localeCompare(texto(b), 'pt-BR', { numeric: true })
}

// Lista os valores diferentes de uma coluna, com a quantidade de vezes que cada um aparece.
export function valoresDistintos(linhas, valorDe) {
  const mapa = new Map()
  linhas.forEach((l) => {
    const bruto = texto(valorDe(l)).trim()
    const chave = normalizar(bruto)
    const e = mapa.get(chave)
    if (e) e.qtd += 1
    else mapa.set(chave, { chave, rotulo: bruto === '' ? '(vazio)' : bruto, qtd: 1 })
  })
  return [...mapa.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR', { numeric: true }))
}

// Junta linhas iguais nas colunas "chaves" e soma a coluna de quantidade (índices de origem).
export function somarLinhas(linhas, chaves, qtd) {
  const mapa = new Map()
  const numero = (v) => Number(texto(v).replace(',', '.')) || 0
  linhas.forEach((l) => {
    let k = chaves.map((o) => normalizar(l.cells[o])).join('|')
    if (!k.replace(/\|/g, '')) k = 'linha:' + l.k // sem chave: não junta com ninguém
    const existente = mapa.get(k)
    if (existente) {
      existente.cells[qtd] = numero(existente.cells[qtd]) + numero(l.cells[qtd])
    } else {
      const copia = { k: l.k, cells: [...l.cells] }
      copia.cells[qtd] = numero(l.cells[qtd])
      mapa.set(k, copia)
    }
  })
  return [...mapa.values()]
}
