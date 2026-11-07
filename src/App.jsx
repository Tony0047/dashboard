import { useMemo, useState } from 'react'
import './App.css'
import useLocalStorage from './hooks/useLocalStorage'
import { reconciliar, layoutVazio } from './utils/layout'
import {
  texto, normalizar, preencher, valorCelula, chaveLinha, compararValores, somarLinhas, seguroParaExcel,
} from './utils/tabela'
import { exportarXlsx, paraNumero } from './utils/exportar'
import FileLoader from './components/FileLoader'
import ArquivosCarregados from './components/ArquivosCarregados'
import DataTable from './components/DataTable'
import PainelFiltro from './components/PainelFiltro'
import DialogoAdicionar from './components/DialogoAdicionar'
import DialogoSoma from './components/DialogoSoma'
import ErroTela from './components/ErroTela'

function Painel() {
  // Dados que sobrevivem ao fechar o app.
  const [arquivos, setArquivos] = useLocalStorage('painel2:arquivos', []) // [{ nome, linhas, colunas }]
  const [layouts, setLayouts] = useLocalStorage('painel2:layouts', {}) // um layout por quantidade de colunas
  const [valores, setValores] = useLocalStorage('painel2:valores', {}) // { idColuna: { chave: texto } }
  const [soma, setSoma] = useLocalStorage('painel2:soma', null) // { chaves: [origem], qtd: origem }
  // Estado só da tela atual.
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState({ id: null, dir: 1 })
  const [filtros, setFiltros] = useState({}) // { idColuna: [valores normalizados] }
  const [dialogo, setDialogo] = useState(null) // { tipo: 'filtro' | 'soma' | 'adicionar', posicao? }

  // ---- Colunas (layout) ----
  const nCols = Math.max(0, ...arquivos.map((a) => a.colunas))
  const layoutSalvo = layouts[nCols] ?? layoutVazio
  const layout = useMemo(() => reconciliar(layoutSalvo, nCols), [layoutSalvo, nCols])
  const colunas = layout.colunas
  const porId = useMemo(() => Object.fromEntries(colunas.map((c) => [c.id, c])), [colunas])
  const mudarLayout = (fn) =>
  setLayouts((ls) => ({ ...ls, [nCols]: fn(reconciliar(ls[nCols] ?? layoutVazio, nCols)) }))

  // ---- Linhas ----
  // 1) Empilha as planilhas (pela posição das colunas); 2) opcionalmente soma itens iguais.
  const empilhadas = useMemo(
    () => arquivos.flatMap((a, ai) => a.linhas.map((r, li) => ({ k: `${ai}-${li}`, cells: preencher(r, nCols) }))),
    [arquivos, nCols],
  )
  const linhasBase = useMemo(
    () => (soma ? somarLinhas(empilhadas, soma.chaves, soma.qtd) : empilhadas),
    [empilhadas, soma],
  )
  // Colunas da planilha sem nenhum conteúdo: podem ser excluídas.
  const vazias = useMemo(
    () => new Set(colunas.filter((c) => c.tipo === 'dado' && empilhadas.every((l) => texto(l.cells[c.origem]).trim() === '')).map((c) => c.id)),
    [colunas, empilhadas],
  )

  // 3) Filtros, busca e ordenação: é o que aparece na tela e vai para o arquivo final.
  const visiveis = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    let lista = linhasBase.filter((l) =>
      Object.entries(filtros).every(([id, sel]) => {
        const c = porId[id]
        return !c || !sel.length || sel.includes(normalizar(valorCelula(l, c, porId, valores)))
      }),
    )
    if (termo) {
      lista = lista.filter((l) => colunas.some((c) => texto(valorCelula(l, c, porId, valores)).toLowerCase().includes(termo)))
    }
    const col = porId[ordem.id]
    if (col) {
      lista = [...lista].sort(
        (a, b) => compararValores(valorCelula(a, col, porId, valores), valorCelula(b, col, porId, valores)) * ordem.dir,
      )
    }
    return lista
  }, [linhasBase, filtros, busca, ordem, colunas, porId, valores])

  // ---- Ações ----
  const acoes = {
    renomear: (id, nome) =>
      mudarLayout((l) => ({ ...l, colunas: l.colunas.map((c) => (c.id === id ? { ...c, nome } : c)) })),

    mover: (id, delta) =>
      mudarLayout((l) => {
        const cols = [...l.colunas]
        const i = cols.findIndex((c) => c.id === id)
        const j = i + delta
        if (i < 0 || j < 0 || j >= cols.length) return l
        const temp = cols[i]
        cols[i] = cols[j]
        cols[j] = temp
        return { ...l, colunas: cols }
      }),

    ordenar: (id) => setOrdem((o) => (o.id === id ? { id, dir: -o.dir } : { id, dir: 1 })),

    excluir: (id) => {
      const col = porId[id]
      if (!col) return
      if (col.tipo === 'dado') {
        // Colunas de preço/observação que usam esta como identificador do produto: bloqueia.
        const dependentes = colunas.filter((c) => c.tipo !== 'dado' && c.chave === id)
        if (dependentes.length) {
          alert(
            `Não é possível excluir "${col.nome || 'esta coluna'}": ela identifica o produto em ` +
              `${dependentes.map((c) => `"${c.nome}"`).join(', ')}. Exclua essas colunas antes.`,
          )
          return
        }
        const naSoma = soma && (soma.chaves.includes(col.origem) || soma.qtd === col.origem)
        if (!vazias.has(id)) {
          const aviso = `Excluir a coluna "${col.nome || 'sem nome'}"? Ela só será ocultada: a planilha original não muda e dá para restaurá-la depois.`
          if (!confirm(aviso + (naSoma ? ' A soma ativa usa esta coluna e será desfeita.' : ''))) return
        }
        if (naSoma) setSoma(null)
      } else if (!confirm(`Excluir a coluna "${col.nome}" e os valores digitados nela?`)) {
        return
      }
      mudarLayout((l) => ({
        colunas: l.colunas.filter((c) => c.id !== id),
        removidas: col.tipo === 'dado' ? [...l.removidas, id] : l.removidas,
      }))
      if (col.tipo !== 'dado') {
        setValores((v) => {
          const novo = { ...v }
          delete novo[id]
          return novo
        })
      }
      setFiltros((f) => {
        const novo = { ...f }
        delete novo[id]
        return novo
      })
      if (ordem.id === id) setOrdem({ id: null, dir: 1 })
    },

    adicionar: (posicao) => setDialogo({ tipo: 'adicionar', posicao }),

    // Grava o valor digitado, ligado ao conteúdo da coluna "chave" (ex.: o código).
    editar: (col, linha, valor) => {
      const chave = chaveLinha(linha, col, porId)
      if (!chave) return
      setValores((v) => ({ ...v, [col.id]: { ...v[col.id], [chave]: valor } }))
    },
  }

  function criarColuna({ tipo, nome, chave }) {
    const id = `${tipo === 'preco' ? 'p' : 'o'}${Date.now()}`
    const posicao = dialogo.posicao
    mudarLayout((l) => {
      const cols = [...l.colunas]
      cols.splice(posicao, 0, { id, tipo, nome, chave })
      return { ...l, colunas: cols }
    })
    setDialogo(null)
  }

  // Planilha com o mesmo nome substitui a anterior (evita somar duas vezes sem querer).
  function adicionarArquivos(novos) {
    setArquivos((atual) => [...atual.filter((a) => !novos.some((n) => n.nome === a.nome)), ...novos])
    setFiltros({})
  }

  function limparPlanilhas() {
    if (confirm('Remover todas as planilhas carregadas? Nomes de colunas e valores digitados são mantidos.')) {
      setArquivos([])
      setFiltros({})
      setSoma(null)
    }
  }
  // As colunas excluídas voltam no fim da tabela, com os nomes padrão.
  function restaurarExcluidas() {
    mudarLayout((l) => ({ ...l, removidas: [] }));
  }
  {
    layout.removidas.length > 0 && (
      <button className="botao sec" onClick={restaurarExcluidas}>
        Restaurar colunas excluídas ({layout.removidas.length})
      </button>
    );
  }
  function redefinirColunas() {
    if (confirm('Voltar às colunas originais? As colunas de preço/observação criadas serão removidas.')) {
      setLayouts((ls) => ({ ...ls, [nCols]: layoutVazio }))
      setValores({})
      setFiltros({})
      setOrdem({ id: null, dir: 1 })
    }
  }

  const ativos = Object.values(filtros).filter((s) => s.length)
  // Se houver um único valor filtrado, ele entra no nome do arquivo (ex.: cotacao_final_BARROSO.xlsx)
  const sufixo =
    ativos.length === 1 && ativos[0].length === 1 && ativos[0][0]
      ? '_' + ativos[0][0].replace(/[^\p{L}\p{N}]+/gu, '_')
      : ''

  function gerarArquivo() {
    const titulos = colunas.map((c) => c.nome || 'Coluna')
    const matriz = visiveis.map((l) =>
      colunas.map((c) => {
        const v = valorCelula(l, c, porId, valores)
        return c.tipo === 'preco' ? paraNumero(v) : seguroParaExcel(v)
      }),
    )
    const idxPreco = colunas.map((c, i) => (c.tipo === 'preco' ? i : -1)).filter((i) => i >= 0)
    exportarXlsx(titulos, matriz, idxPreco, `cotacao_final${sufixo}.xlsx`)
  }

  const colunasDado = colunas.filter((c) => c.tipo === 'dado' && !vazias.has(c.id))

  return (
    <main>
      <h1>Painel de Cotação</h1>

      <div className="barra">
        <FileLoader onCarregar={adicionarArquivos} />
        <input
          type="search"
          placeholder="Buscar em todas as colunas"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <ArquivosCarregados
        arquivos={arquivos}
        onRemover={(nome) => {
          setArquivos((a) => a.filter((x) => x.nome !== nome))
          setFiltros({})
        }}
      />

      {linhasBase.length === 0 ? (
        <p className="vazio">
          Nenhuma planilha carregada. Toque em “Adicionar planilha” e escolha um ou mais arquivos.
        </p>
      ) : (
        <>
          <div className="barra">
            <button className="botao sec" onClick={() => setDialogo({ tipo: 'filtro' })}>
              Filtro{ativos.length ? ` (${ativos.length})` : ''}
            </button>
            <button className="botao sec" onClick={() => setDialogo({ tipo: 'soma' })}>
              {soma ? 'Soma ativa (ajustar)' : 'Somar itens iguais'}
            </button>
          </div>

          {ativos.length > 0 && (
            <div className="chips">
              {Object.entries(filtros)
                .filter(([, s]) => s.length)
                .map(([id, s]) => (
                  <button
                    key={id}
                    className="chip"
                    aria-pressed="true"
                    onClick={() =>
                      setFiltros((f) => {
                        const novo = { ...f }
                        delete novo[id]
                        return novo
                      })
                    }
                  >
                    {porId[id]?.nome || 'Coluna'}: {s.map((x) => x || '(vazio)').join(', ')} ✕
                  </button>
                ))}
            </div>
          )}

          <p className="resumo">
            <b>{visiveis.length}</b> de {linhasBase.length} linhas
          </p>

          <DataTable
            colunas={colunas}
            linhas={visiveis}
            porId={porId}
            valores={valores}
            ordem={ordem}
            vazias={vazias}
            acoes={acoes}
          />

          <div className="barra rodape">
            <button className="botao" onClick={gerarArquivo}>
              Gerar arquivo final (linhas exibidas)
            </button>
            <button className="botao sec" onClick={redefinirColunas}>Redefinir colunas</button>
            <button className="botao sec" onClick={limparPlanilhas}>Limpar planilhas</button>
          </div>
        </>
      )}

      {dialogo?.tipo === 'filtro' && (
        <PainelFiltro
          colunas={colunas}
          linhasBase={linhasBase}
          porId={porId}
          valores={valores}
          filtros={filtros}
          onMudar={setFiltros}
          onFechar={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === 'adicionar' && (
        <DialogoAdicionar colunasChave={colunasDado} 
        onConfirmar={criarColuna} 
        onCancelar={() =>setDialogo(null)}/>
      )}
      {dialogo?.tipo === 'soma' && (
        <DialogoSoma
          colunasDado={colunasDado}
          atual={soma}
          onConfirmar={(s) => {
            setSoma(s)
            setDialogo(null)
          }}
          onDesfazer={() => {
            setSoma(null)
            setDialogo(null)
          }}
          onCancelar={() => setDialogo(null)}
        />
      )}
    </main>
  )
}

// Componente exportado: envolve o painel com a proteção contra tela preta.
export default function App() {
  return (
    <ErroTela>
      <Painel />
    </ErroTela>
  )
}
