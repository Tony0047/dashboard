import { useMemo, useState } from 'react'
import './App.css'
import useLocalStorage from './hooks/useLocalStorage'
import { mesclar } from './utils/mesclar'
import { exportarXlsx, paraNumero } from './utils/exportar'
import FileLoader from './components/FileLoader'
import ArquivosCarregados from './components/ArquivosCarregados'
import BairroFilter from './components/BairroFilter'
import DataTable from './components/DataTable'
import ErroTela from './components/ErroTela'

// Colunas mostradas na tela e no arquivo exportado (preço fica ao lado do produto).
const COLUNAS_TELA = [
  { chave: 'codigo', titulo: 'Código' },
  { chave: 'produto', titulo: 'Produto' },
  { chave: 'preco', titulo: 'Preço (R$)' },
  { chave: 'obs', titulo: 'Anotação' },
  { chave: 'ean', titulo: 'EAN / Cód. barras' },
  { chave: 'fabricante', titulo: 'Fabricante' },
  { chave: 'quantidade', titulo: 'Qtd' },
  { chave: 'bairro', titulo: 'Bairro' },
  { chave: 'tipo', titulo: 'Tipo' },
]

// Compara dois itens pela coluna escolhida; empate desempata pelo nome do produto.
function comparar(a, b, { chave, dir }) {
  const x = chave === 'preco' ? paraNumero(a.preco) : a[chave]
  const y = chave === 'preco' ? paraNumero(b.preco) : b[chave]
  const c =
    typeof x === 'number' && typeof y === 'number'
      ? x - y
      : String(x).localeCompare(String(y), 'pt-BR', { numeric: true })
  return c ? c * dir : a.produto.localeCompare(b.produto, 'pt-BR')
}

function Painel() {
  // Dados que sobrevivem ao fechar o app (hook personalizado).
  const [arquivos, setArquivos] = useLocalStorage('painel:arquivos', [])
  const [precos, setPrecos] = useLocalStorage('painel:precos', {}) // { codigo: "12,50" }
  const [obs, setObs] = useLocalStorage('painel:obs', {})
  const [barras, setBarras] = useLocalStorage('painel:barras', {})
  // Estado só da tela atual.
  const [bairro, setBairro] = useState('') // '' = todos
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState({ chave: 'bairro', dir: 1 })

  // 1) A + B = resultado (soma das quantidades)
  const mesclados = useMemo(() => mesclar(arquivos), [arquivos])

  // 2) Acrescenta preço, anotação e código de barras digitados à mão
  const completos = useMemo(
    () =>
      mesclados.map((i) => {
        const temEan = String(i.ean) !== ''
        return {
          ...i,
          temEan,
          ean: temEan ? i.ean : (barras[i.codigo] ?? ''),
          preco: precos[i.codigo] ?? '',
          obs: obs[i.codigo] ?? '',
        }
      }),
    [mesclados, precos, obs, barras],
  )

  // 3) Ordena tudo (é esta ordem que vai para o arquivo final)
  const ordenados = useMemo(() => [...completos].sort((a, b) => comparar(a, b, ordem)), [completos, ordem])

  // 4) Aplica filtro de bairro e busca (afeta só o que aparece na tela)
  const visiveis = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    return ordenados
      .filter((i) => !bairro || i.bairro === bairro)
      .filter((i) => !termo || COLUNAS_TELA.map((c) => i[c.chave]).join(' ').toLowerCase().includes(termo))
  }, [ordenados, bairro, busca])

  const bairros = useMemo(() => {
    const contagem = {}
    completos.forEach((i) => {
      contagem[i.bairro] = (contagem[i.bairro] || 0) + 1
    })
    return Object.keys(contagem)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((nome) => ({ nome, qtd: contagem[nome] }))
  }, [completos])

  const totalUnidades = visiveis.reduce((soma, i) => soma + i.quantidade, 0)
  const comPreco = completos.filter((i) => paraNumero(i.preco) !== '').length

  function ordenarPor(chave) {
    setOrdem((o) => (o.chave === chave ? { chave, dir: -o.dir } : { chave, dir: 1 }))
  }

  // Preço, anotação e código de barras ficam guardados por código de produto.
  function editar(campo, codigo, valor) {
    const gravar = { preco: setPrecos, obs: setObs, ean: setBarras }[campo]
    gravar((atual) => ({ ...atual, [codigo]: valor }))
  }

  // Planilha com o mesmo nome substitui a anterior (evita somar duas vezes sem querer).
  function adicionar(novos) {
    setArquivos((atual) => [...atual.filter((a) => !novos.some((n) => n.nome === a.nome)), ...novos])
    setBairro('')
  }

  function limparPlanilhas() {
    if (confirm('Remover todas as planilhas carregadas? Os preços digitados serão mantidos.')) {
      setArquivos([])
      setBairro('')
    }
  }

  return (
    <main>
      <h1>Painel de Cotação</h1>

      <div className="barra">
        <FileLoader onCarregar={adicionar} />
        <input
          type="search"
          placeholder="Buscar produto, fabricante ou código"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <ArquivosCarregados arquivos={arquivos} onRemover={(nome) => setArquivos((a) => a.filter((x) => x.nome !== nome))} />

      {completos.length === 0 ? (
        <p className="vazio">
          Nenhuma planilha carregada. Toque em “Adicionar planilha” e escolha um ou mais arquivos.
        </p>
      ) : (
        <>
          <BairroFilter bairros={bairros} selecionado={bairro} total={completos.length} onSelecionar={setBairro} />
          <p className="resumo">
            <b>{visiveis.length}</b> itens · <b>{totalUnidades}</b> unidades · preços preenchidos:{' '}
            <b>{comPreco}</b> de {completos.length}
          </p>
          <DataTable itens={visiveis} colunas={COLUNAS_TELA} ordem={ordem} onOrdenar={ordenarPor} onEditar={editar} />
          <div className="barra rodape">
            <button className="botao" onClick={() => exportarXlsx(ordenados, COLUNAS_TELA, 'cotacao_final.xlsx')}>
              Gerar arquivo final (com preços)
            </button>
            <button className="botao sec" onClick={limparPlanilhas}>
              Limpar planilhas
            </button>
          </div>
        </>
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
