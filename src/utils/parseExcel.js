import * as XLSX from 'xlsx'
import { preencher } from './tabela'

// Inteiros muito grandes (como o EAN de 13 dígitos) viram texto: sem perder dígitos
// e sem aparecer em notação científica.
const limpar = (celula) =>
  typeof celula === 'number' && Number.isInteger(celula) && Math.abs(celula) >= 1e11
    ? String(celula)
    : celula

// Lê TODAS as colunas e TODAS as abas do arquivo, sem presumir o que cada coluna é.
// Devolve { linhas: [[...], [...]], colunas: quantidade de colunas }.
export async function lerPlanilha(arquivo) {
  const buffer = await arquivo.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const linhas = []

  for (const nomeAba of wb.SheetNames) {
    // header: 1 devolve cada linha como lista simples (a planilha não tem cabeçalho)
    const aba = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], { header: 1, raw: true, defval: '' })
    for (const linha of aba) {
      if (linha.every((c) => c === '' || c === null)) continue // ignora linha vazia
      linhas.push(linha.map(limpar))
    }
  }

  const colunas = linhas.reduce((maior, l) => Math.max(maior, l.length), 0)
  return { linhas: linhas.map((l) => preencher(l, colunas)), colunas }
}
