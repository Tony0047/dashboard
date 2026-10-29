// Lista as planilhas somadas (A, B, ...) e permite remover cada uma.
export default function ArquivosCarregados({ arquivos, onRemover }) {
  if (!arquivos.length) return null
  const letras = arquivos.map((_, i) => String.fromCharCode(65 + i))

  return (
    <div className="fontes">
      <ul>
        {arquivos.map((a, i) => (
          <li key={a.nome}>
            <b>{letras[i]}</b> {a.nome} · {a.itens.length} linhas
            <button onClick={() => onRemover(a.nome)} aria-label={`Remover ${a.nome}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      {arquivos.length > 1 && (
        <p>
          Resultado = {letras.join(' + ')} (quantidades somadas por produto e bairro)
        </p>
      )}
    </div>
  )
}
