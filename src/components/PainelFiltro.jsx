import { useMemo, useState } from 'react'
import Modal from './Modal'
import { valorCelula, valoresDistintos } from '../utils/tabela'

// Escolhe uma coluna e marca os valores que devem aparecer (com a contagem de cada um).
export default function PainelFiltro({ colunas, linhasBase, porId, valores, filtros, onMudar, onFechar }) {
  const [colId, setColId] = useState(colunas[0]?.id ?? '')
  const [soRepetidos, setSoRepetidos] = useState(false)
  const col = porId[colId]

  const distintos = useMemo(
    () => (col ? valoresDistintos(linhasBase, (l) => valorCelula(l, col, porId, valores)) : []),
    [col, linhasBase, porId, valores],
  )
  const lista = soRepetidos ? distintos.filter((v) => v.qtd > 1) : distintos
  const selecionados = filtros[colId] || []

  function alternar(chave) {
    const novo = selecionados.includes(chave)
      ? selecionados.filter((x) => x !== chave)
      : [...selecionados, chave]
    const copia = { ...filtros }
    if (novo.length) copia[colId] = novo
    else delete copia[colId]
    onMudar(copia)
  }

  return (
    <Modal titulo="Filtrar por coluna" onFechar={onFechar}>
      <label className="rotulo">
        Coluna
        <select value={colId} onChange={(e) => setColId(e.target.value)}>
          {colunas.map((c) => (
            <option key={c.id} value={c.id}>{c.nome || '(sem nome)'}</option>
          ))}
        </select>
      </label>
      <label>
        <input type="checkbox" checked={soRepetidos} onChange={(e) => setSoRepetidos(e.target.checked)} />
        Mostrar só valores que se repetem
      </label>
      <div className="lista-valores">
        {lista.map((v) => (
          <label key={v.chave}>
            <input type="checkbox" checked={selecionados.includes(v.chave)} onChange={() => alternar(v.chave)} />
            {v.rotulo} ({v.qtd})
          </label>
        ))}
        {!lista.length && <p className="ajuda">Nenhum valor para mostrar.</p>}
      </div>
      <div className="barra">
        <button className="botao sec" onClick={() => onMudar({})}>Limpar todos os filtros</button>
        <button className="botao" onClick={onFechar}>Concluir</button>
      </div>
    </Modal>
  )
}
