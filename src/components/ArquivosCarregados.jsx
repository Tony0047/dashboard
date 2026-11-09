// Lista as planilhas carregadas; a caixa marca quais entram na tabela. ✕ remove a planilha.
export default function ArquivosCarregados({ arquivos, desmarcados, onAlternar, onRemover }) {
  if (!arquivos.length) return null
  const marcadas = arquivos.filter((a) => !desmarcados.includes(a.nome)).length

  return (
    <div className="fontes">
      <ul>
        {arquivos.map((a, i) => (
          <li key={a.nome}>
            <label>
              <input
                type="checkbox"
                checked={!desmarcados.includes(a.nome)}
                onChange={() => onAlternar(a.nome)}
              />
              <b>{i + 1}</b> {a.nome} · {a.linhas.length} linhas
            </label>
            <button onClick={() => onRemover(a.nome)} aria-label={`Remover ${a.nome}`}>✕</button>
          </li>
        ))}
      </ul>
      {marcadas > 1 && <p>As linhas das planilhas marcadas são empilhadas pela posição das colunas.</p>}
    </div>
  )
}