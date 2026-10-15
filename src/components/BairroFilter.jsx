// Botões "Todos" + um por bairro. Tocar em um deles filtra a tabela.
export default function BairroFilter({ bairros, selecionado, total, onSelecionar }) {
  return (
    <div className="chips">
      <button
        className="chip"
        aria-pressed={selecionado === ''}
        onClick={() => onSelecionar('')}
      >
        Todos ({total})
      </button>
      {bairros.map((b) => (
        <button
          key={b.nome}
          className="chip"
          aria-pressed={selecionado === b.nome}
          onClick={() => onSelecionar(b.nome)}
        >
          {b.nome || 'Sem bairro'} ({b.qtd})
        </button>
      ))}
    </div>
  )
}
