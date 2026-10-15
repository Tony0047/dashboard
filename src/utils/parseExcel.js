import * as XLSX from 'xlsx'

// Ordem das colunas na planilha do cliente (ela NÃO tem cabeçalho).
// Se um dia a ordem mudar, basta ajustar esta lista.
export const COLUNAS = [
  { chave: 'codigo', titulo: 'Código' },
  { chave: 'produto', titulo: 'Produto' },
  { chave: 'ean', titulo: 'EAN' },
  { chave: 'fabricante', titulo: 'Fabricante' },
  { chave: 'quantidade', titulo: 'Qtd' },
  { chave: 'bairro', titulo: 'Bairro' },
  { chave: 'tipo', titulo: 'Tipo' },
]

// Lê o arquivo escolhido e devolve uma lista de objetos, um por linha.
// Todas as abas são juntadas: a organização por bairro vem da coluna, não da aba.
export async function lerPlanilha(arquivo) {
  const buffer = await arquivo.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const itens = []

  for (const nomeAba of wb.SheetNames) {
    // header: 1 devolve cada linha como um array simples (sem usar cabeçalho)
    const linhas = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], {
      header: 1,
      raw: true,
      defval: '',
    })

    linhas.forEach((linha, i) => {
      if (linha.every((celula) => celula === '')) return // ignora linha vazia
      // se a 1ª linha tiver texto no lugar da quantidade, é um cabeçalho: ignora
      if (i === 0 && isNaN(Number(linha[4]))) return

      const item = {}
      COLUNAS.forEach((col, idx) => {
        item[col.chave] = linha[idx] ?? ''
      })
      // códigos como texto (evita notação científica); quantidade como número
      item.codigo = String(item.codigo)
      item.ean = String(item.ean)
      item.produto = String(item.produto)
      item.bairro = String(item.bairro).trim()
      item.quantidade = Number(item.quantidade) || 0
      itens.push(item)
    })
  }
  return itens
}
