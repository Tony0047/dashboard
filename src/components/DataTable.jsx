import { Fragment } from 'react'

// Tabela de itens. Tocar no título de uma coluna ordena por ela.
// Quando a ordenação é por bairro, aparece uma faixa de título a cada bairro novo.
export default function DataTable({ itens, colunas, ordem, onOrdenar }) {
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
          {itens.map((item, i) => {
            const novoGrupo = agrupar && item.bairro !== anterior
            anterior = item.bairro
            return (
              // Fragment agrupa duas linhas <tr> sem criar elemento extra no HTML
              <Fragment key={i}>
                {novoGrupo && (
                  <tr className="grupo">
                    <td colSpan={colunas.length}>{item.bairro || 'Sem bairro'}</td>
                  </tr>
                )}
                <tr>
                  {colunas.map((c) => (
                    <td key={c.chave} className={c.chave === 'quantidade' ? 'num' : ''}>
                      {String(item[c.chave])}
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
