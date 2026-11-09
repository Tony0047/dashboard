// Cabeçalho de uma coluna: nome editável + ◀ ordenar ▶ ✕ +
export default function CabecalhoColuna({
  coluna, indice, total, ordem, vazia,
  onRenomear, onMover, onOrdenar, onExcluir, onAdicionar,
}) {
  return (
    <th>
      <input
        className="nome-col"
        value={coluna.nome}
        placeholder="Nome da coluna"
        onChange={(e) => onRenomear(coluna.id, e.target.value)}
        aria-label={`Nome da coluna ${indice + 1}`}
      />
      <div className="cab-acoes">
        <button className="seta" disabled={indice === 0} onClick={() => onMover(coluna.id, -1)}
          aria-label={`Mover ${coluna.nome || 'coluna'} para a esquerda`}>◀</button>
        <button className="seta" onClick={() => onOrdenar(coluna.id)}
          aria-label={`Ordenar por ${coluna.nome || 'coluna'}`}>
          {ordem.id === coluna.id ? (ordem.dir > 0 ? '▲' : '▼') : '⇅'}
        </button>
        <button className="seta" disabled={indice === total - 1} onClick={() => onMover(coluna.id, 1)}
          aria-label={`Mover ${coluna.nome || 'coluna'} para a direita`}>▶</button>
        <button className="seta exc" onClick={() => onExcluir(coluna.id)}
          aria-label={`Excluir ${coluna.nome || 'coluna'}`}>✕</button>
        <button className="seta mais" onClick={() => onAdicionar(indice + 1)}
          aria-label="Adicionar coluna à direita">+</button>
      </div>
      {vazia && <small className="vazia">vazia</small>}
    </th>
  )
}
