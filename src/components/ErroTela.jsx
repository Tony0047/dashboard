import { Component } from 'react'

// "Error Boundary": se algo der errado ao desenhar a tela, mostra a mensagem do erro
// em vez de deixar a tela toda preta. (Precisa ser uma classe: é uma exigência do React.)
export default class ErroTela extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  // Apaga os dados salvos pelo painel (planilhas, preços) e recarrega a página.
  limpar = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('painel:'))
        .forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignora */
    }
    location.reload()
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="erro">
        <h2>Ocorreu um erro ao montar a tela</h2>
        <pre>{String(this.state.erro?.stack || this.state.erro).slice(0, 1500)}</pre>
        <button className="botao" onClick={this.limpar}>
          Limpar dados salvos e recarregar
        </button>
      </div>
    )
  }
}
