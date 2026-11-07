import { lerPlanilha } from '../utils/parseExcel'

// Botão que permite escolher UMA OU MAIS planilhas (atributo "multiple").
// Entrega ao App uma lista de { nome, linhas, colunas }.
export default function FileLoader({ onCarregar }) {
  async function aoEscolher(evento) {
    const arquivos = [...evento.target.files]
    evento.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!arquivos.length) return
    try {
      const lidos = []
      for (const arquivo of arquivos) {
        try {
          lidos.push({ nome: arquivo.name, ...(await lerPlanilha(arquivo)) })
        } catch {
          alert(`Não foi possível ler "${arquivo.name}". Use uma planilha Excel (.xlsx) ou CSV.`)
        }
      }
      if (lidos.length) onCarregar(lidos)
    } catch (erro) {
      alert('Erro ao adicionar a planilha: ' + erro.message)
    }
  }

  return (
    <label className="botao">
      Adicionar planilha
      <input type="file" accept=".xlsx,.xls,.csv" multiple onChange={aoEscolher} hidden />
    </label>
  )
}
