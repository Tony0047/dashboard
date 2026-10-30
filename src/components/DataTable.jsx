import { Fragment } from 'react'
import { formatarPreco } from '../utils/exportar'

// Células editáveis: preço, anotação e código de barras (só quando a planilha não trouxe o EAN).
function Celula({ item, coluna, onEditar }) {
  const { chave } = coluna
  if (chave === 'preco') {
    return (
      <input
        className="campo preco"
        inputMode="decimal"
        placeholder="0,00"
        value={item.preco}
        onChange={(e) => onEditar('preco', item.codigo, e.target.value.replace(/[^\d.,]/g, ''))}
        onBlur={(e) => onEditar('preco', item.codigo, formatarPreco(e.target.value))}
        aria-label={`Preço de ${item.produto}`}
      />
    )
  }
  if (chave === 'obs') {
    return (
      <input
        className="campo"
        placeholder="Anotação"
        value={item.obs}
        onChange={(e) => onEditar('obs', item.codigo, e.target.value)}
        aria-label={`Anotação de ${item.produto}`}
      />
    )
  }
  if (chave === 'ean' && !item.temEan) {
    return (
      <input
        className="campo"
        inputMode="numeric"
        placeholder="Código de barras"
        value={item.ean}
        onChange={(e) => onEditar('ean', item.codigo, e.target.value)}
        aria-label={`Código de barras de ${item.produto}`}
      />
    )
  }
  return String(item[chave])
}

// Tabela de itens. Tocar no título de uma coluna ordena por ela.
// Quando a ordenação é por bairro, aparece uma faixa de título a cada bairro novo.
export default function DataTable({ itens, colunas, ordem, onOrdenar, onEditar }) {
  const agrupar = ordem.chave === 'bairro'
  let anterior = null

  return (
    <div className="tabela-wrap">
      <table>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.chave} onClick={() => onOrdenar(c.chave)}>
                {c.titulo}
                {ordem.chave === c.chave ? (ordem.dir > 0 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const novoGrupo = agrupar && item.bairro !== anterior
            anterior = item.bairro
            return (
              <Fragment key={`${item.codigo}|${item.bairro}`}>
                {novoGrupo && (
                  <tr className="grupo">
                    <td colSpan={colunas.length}>{item.bairro || 'Sem bairro'}</td>
                  </tr>
                )}
                <tr>
                  {colunas.map((c) => (
                    <td key={c.chave} className={c.chave === 'quantidade' ? 'num' : ''}>
                      <Celula item={item} coluna={c} onEditar={onEditar} />
                    </td>
                  ))}
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
