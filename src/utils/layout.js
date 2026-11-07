// Nomes sugeridos só quando a planilha tem exatamente as 7 colunas do exemplo.
const NOMES_7 = ['Código', 'Produto', 'EAN', 'Fabricante', 'Qtd', 'Bairro', 'Tipo']

// 0 -> "A", 1 -> "B", ... 26 -> "AA"
export function letraColuna(i) {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  }
  return s
}

export const nomeInicial = (i, total) => (total === 7 ? NOMES_7[i] : `Coluna ${letraColuna(i)}`)

// O layout guarda como as colunas aparecem:
//   colunas:   lista na ordem da tela. Cada item é
//              { id, tipo: 'dado',  origem, nome }            -> coluna da planilha
//              { id, tipo: 'preco' | 'obs', nome, chave }     -> coluna criada pelo usuário
//              ("chave" = id da coluna de dados que identifica o produto)
//   removidas: ids de colunas da planilha que o usuário excluiu (não voltam sozinhas)
export const layoutVazio = { colunas: [], removidas: [] }

// Garante que todas as colunas da planilha existam no layout, sem trazer de volta as removidas.
export function reconciliar(layout, total) {
  const existentes = new Set(layout.colunas.filter((c) => c.tipo === 'dado').map((c) => c.id))
  const removidas = new Set(layout.removidas)
  const novas = []
  for (let i = 0; i < total; i++) {
    const id = `c${i}`
    if (!existentes.has(id) && !removidas.has(id)) {
      novas.push({ id, tipo: 'dado', origem: i, nome: nomeInicial(i, total) })
    }
  }
  return novas.length ? { ...layout, colunas: [...layout.colunas, ...novas] } : layout
}
