import { useState } from 'react'
import Modal from './Modal'

// Cria uma coluna de Preço ou de Observação e pergunta qual coluna identifica o produto.
export default function DialogoAdicionar({ colunasChave, onConfirmar, onCancelar }) {
  const [tipo, setTipo] = useState('preco')
  const [nome, setNome] = useState('')
  const [chave, setChave] = useState(colunasChave[0]?.id ?? '')
  const padrao = tipo === 'preco' ? 'Preço' : 'Observação'

  return (
    <Modal titulo="Adicionar coluna" onFechar={onCancelar}>
      <label className="rotulo">
        Tipo da coluna
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="preco">Preço (número, ex.: 12,50)</option>
          <option value="obs">Observação (texto)</option>
        </select>
      </label>
      <label className="rotulo">
        Nome
        <input className="campo" value={nome} placeholder={padrao} onChange={(e) => setNome(e.target.value)} />
      </label>
      <label className="rotulo">
        Qual coluna identifica o produto (ex.: código)?
        <select value={chave} onChange={(e) => setChave(e.target.value)}>
          {colunasChave.map((c) => (
            <option key={c.id} value={c.id}>{c.nome || '(sem nome)'}</option>
          ))}
        </select>
      </label>
      <p className="ajuda">
        O valor digitado fica ligado ao conteúdo dessa coluna: o mesmo código recebe o mesmo valor em todas as linhas.
      </p>
      <div className="barra">
        <button className="botao sec" onClick={onCancelar}>Cancelar</button>
        <button className="botao" disabled={!chave}
          onClick={() => onConfirmar({ tipo, nome: nome.trim() || padrao, chave })}>
          Adicionar
        </button>
      </div>
    </Modal>
  )
}
