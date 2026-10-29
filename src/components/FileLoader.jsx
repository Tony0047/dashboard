import { lerPlanilha } from '../utils/parseExcel'
import { useState } from 'react'

// Botão que abre o seletor de arquivos e entrega os itens lidos ao App.
// "props" são os parâmetros do componente: aqui recebemos funções e valores do pai.
export default function FileLoader({ onCarregar }) {
  const [carregando, setCarregando] = useState(false)

  async function aoEscolher(evento) {
    const arquivos = Array.from(evento.target.files ?? [])
    if (!arquivos.length) return

    setCarregando(true)
    try {
      const planilhas = await Promise.all(
        arquivos.map(async (arquivo) => ({
          nome: arquivo.name,
          itens: await lerPlanilha(arquivo),
        })),
      )
      onCarregar(planilhas)
    } catch {
      alert('Não foi possível ler o arquivo. Use uma planilha Excel (.xlsx) ou CSV.')
    } finally {
      evento.target.value = ''
      setCarregando(false)
    }
  }

  return (
    <label className="botao" aria-busy={carregando}>
      {carregando ? 'Lendo planilha...' : 'Adicionar planilha'}
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={aoEscolher}
        multiple
        disabled={carregando}
        hidden
      />
    </label>
  )
}
