import * as XLSX from 'xlsx'

// Converte "12,50", "1.234,50" ou "12.5" em número; devolve '' se não for um valor válido.
// Se houver vírgula, ela é o decimal e os pontos são separadores de milhar.
export function paraNumero(texto) {
  let t = String(texto ?? '').trim()
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return t !== '' && !isNaN(n) ? n : ''
}

// Mostra o valor como preço brasileiro: 12,5 -> "12,50"; 1234.5 -> "1.234,50".
export function formatarPreco(texto) {
  const n = paraNumero(texto)
  return n === ''
    ? ''
    : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Monta a planilha: 1ª linha = títulos; colunas de preço recebem formato de moeda.
export function montarPlanilha(titulos, matriz, colunasPreco) {
  const planilha = XLSX.utils.aoa_to_sheet([titulos, ...matriz])
  planilha['!cols'] = titulos.map((t, c) => {
    const maior = matriz.slice(0, 200).reduce((m, l) => Math.max(m, String(l[c] ?? '').length), String(t).length)
    return { wch: Math.min(45, Math.max(10, maior + 2)) }
  })
  colunasPreco.forEach((c) => {
    for (let r = 1; r <= matriz.length; r++) {
      const celula = planilha[XLSX.utils.encode_cell({ r, c })]
      if (celula && celula.t === 'n') celula.z = '"R$" #,##0.00'
    }
  })
  return planilha
}

// Gera o arquivo final com as linhas na ordem recebida.
export function exportarXlsx(titulos, matriz, colunasPreco, nomeArquivo) {
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, montarPlanilha(titulos, matriz, colunasPreco), 'Cotação')
  XLSX.writeFile(livro, nomeArquivo)
}
