import * as XLSX from 'xlsx'

// Converte "12,50", "1.234,50" ou "12.5" em número; devolve '' se não for um valor válido.
// Se houver vírgula, ela é o decimal e os pontos são separadores de milhar.
export function paraNumero(texto) {
  let t = String(texto).trim()
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

// Gera o arquivo final: uma linha por item, na ordem recebida, com preço e anotação.
export function exportarXlsx(itens, colunas, nomeArquivo) {
  const linhas = itens.map((item) => {
    const linha = {}
    colunas.forEach((c) => {
      linha[c.titulo] = c.chave === 'preco' ? paraNumero(item.preco) : item[c.chave]
    })
    return linha
  })
  const planilha = XLSX.utils.json_to_sheet(linhas)
  planilha['!cols'] = colunas.map((c) => ({ wch: c.chave === 'produto' ? 38 : 16 }))

  // Coluna de preço no formato de moeda (o Excel exibe com vírgula no idioma português)
  const idxPreco = colunas.findIndex((c) => c.chave === 'preco')
  if (idxPreco >= 0) {
    for (let r = 1; r <= itens.length; r++) {
      const celula = planilha[XLSX.utils.encode_cell({ r, c: idxPreco })]
      if (celula && celula.t === 'n') celula.z = '"R$" #,##0.00'
    }
  }

  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Cotação')
  XLSX.writeFile(livro, nomeArquivo)
}