import { useState } from 'react'
import Modal from './Modal'

// Junta linhas iguais (nas colunas marcadas) e soma a coluna de quantidade.
export default function DialogoSoma({ colunasDado, atual, onConfirmar, onDesfazer, onCancelar }) {
  const [chaves, setChaves] = useState(atual?.chaves ?? [])
  const [qtd, setQtd] = useState(atual?.qtd ?? '')
  const valido = chaves.length > 0 && qtd !== '' && !chaves.includes(qtd)

  const alternar = (o) =>
    setChaves((cs) => (cs.includes(o) ? cs.filter((x) => x !== o) : [...cs, o]))

  return (
    <Modal titulo="Somar itens iguais" onFechar={onCancelar}>
      <p className="ajuda">
        Linhas com os mesmos valores nas colunas marcadas viram uma só, e a quantidade é somada.
        Exemplo: marque Código e Bairro e escolha Qtd como quantidade.
      </p>
      <div className="lista-valores">
        {colunasDado.map((c) => (
          <label key={c.id}>
            <input type="checkbox" checked={chaves.includes(c.origem)} onChange={() => alternar(c.origem)} />
            {c.nome || '(sem nome)'}
          </label>
        ))}
      </div>
      <label className="rotulo">
        Coluna da quantidade
        <select value={qtd} onChange={(e) => setQtd(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">Escolha...</option>
          {colunasDado.map((c) => (
            <option key={c.id} value={c.origem}>{c.nome || '(sem nome)'}</option>
          ))}
        </select>
      </label>
      <div className="barra">
        {atual && <button className="botao sec" onClick={onDesfazer}>Desfazer soma</button>}
        <button className="botao sec" onClick={onCancelar}>Cancelar</button>
        <button className="botao" disabled={!valido} onClick={() => onConfirmar({ chaves, qtd })}>Somar</button>
      </div>
    </Modal>
  )
}
