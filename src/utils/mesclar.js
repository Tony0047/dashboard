// Define quando duas linhas são "o mesmo item": mesmo código E mesmo bairro.
// Para somar por produto independentemente do bairro, troque por: i.codigo
export const chaveItem = (i) => `${i.codigo}|${i.bairro}`

// A + B = resultado: junta as linhas de todas as planilhas e SOMA as quantidades
// dos itens repetidos. Linhas que existem só em uma planilha são mantidas.
export function mesclar(arquivos) {
  const mapa = new Map()
  arquivos.forEach((arquivo) => {
    arquivo.itens.forEach((item) => {
      const chave = chaveItem(item)
      const existente = mapa.get(chave)
      if (existente) {
        existente.quantidade += item.quantidade
        if (!existente.ean && item.ean) existente.ean = item.ean // aproveita o EAN se faltava
      } else {
        mapa.set(chave, { ...item }) // cópia, para não alterar a planilha original
      }
    })
  })
  return [...mapa.values()]
}
