import * as XLSX from 'xlsx'

// Converte "12,50" ou "12.5" em número; devolve '' se não for um valor válido.
export function paraNumero(texto) {
  const t = String(texto).trim().replace(',', '.')
  const n = Number(t)
  return t !== '' && !isNaN(n) ? n : ''
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
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Cotação')
  XLSX.writeFile(livro, nomeArquivo)
}
