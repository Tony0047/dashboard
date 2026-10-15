import { lerPlanilha } from '../utils/parseExcel'

// Botão que abre o seletor de arquivos e entrega os itens lidos ao App.
// "props" são os parâmetros do componente: aqui recebemos funções e valores do pai.
export default function FileLoader({ onCarregar, temDados }) {
  async function aoEscolher(evento) {
    const arquivo = evento.target.files[0]
    if (!arquivo) return
    try {
      onCarregar(await lerPlanilha(arquivo))
    } catch {
      alert('Não foi possível ler o arquivo. Use uma planilha Excel (.xlsx) ou CSV.')
    }
    evento.target.value = '' // permite escolher o mesmo arquivo de novo
  }

  return (
    <label className="botao">
      {temDados ? 'Carregar outra planilha' : 'Carregar planilha'}
      <input type="file" accept=".xlsx,.xls,.csv" onChange={aoEscolher} hidden />
    </label>
  )
}
