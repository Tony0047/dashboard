import CabecalhoColuna from './CabecalhoColuna'
import { formatarPreco } from '../utils/exportar'
import { texto, valorCelula, chaveLinha } from '../utils/tabela'

// Dado da planilha (somente leitura) ou campo digitável (preço / observação).
function Celula({ coluna, linha, valor, desativado, onEditar }) {
  if (coluna.tipo === 'preco') {
    return (
      <input
        className="campo preco"
        inputMode="decimal"
        placeholder="0,00"
        disabled={desativado}
        value={valor}
        onChange={(e) => onEditar(coluna, linha, e.target.value.replace(/[^\d.,]/g, ''))}
        onBlur={(e) => onEditar(coluna, linha, formatarPreco(e.target.value))}
        aria-label={coluna.nome || 'Preço'}
      />
    )
  }
  if (coluna.tipo === 'obs') {
    return (
      <input
        className="campo"
        placeholder="Anotação"
        disabled={desativado}
        value={valor}
        onChange={(e) => onEditar(coluna, linha, e.target.value)}
        aria-label={coluna.nome || 'Observação'}
      />
    )
  }
  return texto(valor)
}

// "acoes" reúne as funções do cabeçalho: renomear, mover, ordenar, excluir, adicionar, editar.
export default function DataTable({ colunas, linhas, porId, valores, ordem, vazias, acoes }) {
  return (
    <div className="tabela-wrap">
      <table>
        <thead>
          <tr>
            <th className="canto">
              <button className="seta mais" onClick={() => acoes.adicionar(0)}
                aria-label="Adicionar coluna no início">+</button>
            </th>
            {colunas.map((c, i) => (
              <CabecalhoColuna
                key={c.id}
                coluna={c}
                indice={i}
                total={colunas.length}
                ordem={ordem}
                vazia={vazias.has(c.id)}
                onRenomear={acoes.renomear}
                onMover={acoes.mover}
                onOrdenar={acoes.ordenar}
                onExcluir={acoes.excluir}
                onAdicionar={acoes.adicionar}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.k}>
              <td className="canto" />
              {colunas.map((c) => (
                <td key={c.id}>
                  <Celula
                    coluna={c}
                    linha={l}
                    valor={valorCelula(l, c, porId, valores)}
                    desativado={c.tipo !== 'dado' && !chaveLinha(l, c, porId)}
                    onEditar={acoes.editar}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
