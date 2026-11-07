// Janela sobreposta simples. Tocar fora dela (ou no ✕) fecha.
export default function Modal({ titulo, onFechar, children }) {
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button className="seta" onClick={onFechar} aria-label="Fechar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
