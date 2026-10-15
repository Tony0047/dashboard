import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { COLUNAS } from './utils/parseExcel'
import FileLoader from './components/FileLoader'
import BairroFilter from './components/BairroFilter'
import DataTable from './components/DataTable'

const CHAVE_STORAGE = 'painel-cotacao:itens'

// Recupera a última planilha carregada (assim ele não precisa reenviar todo dia).
function carregarSalvos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) ?? []
  } catch {
    return []
  }
}

// Compara dois itens pela coluna escolhida; empate desempata pelo nome do produto.
function comparar(a, b, { chave, dir }) {
  const x = a[chave]
  const y = b[chave]
  const c =
    typeof x === 'number' && typeof y === 'number'
      ? x - y
      : String(x).localeCompare(String(y), 'pt-BR', { numeric: true })
  return c ? c * dir : a.produto.localeCompare(b.produto, 'pt-BR')
}

export default function App() {
  // useState: valores que, ao mudar, fazem a tela ser redesenhada.
  const [itens, setItens] = useState(carregarSalvos)
  const [bairro, setBairro] = useState('') // '' = todos
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState({ chave: 'bairro', dir: 1 })

  // useEffect: executa um efeito colateral quando algo muda (aqui, salvar os itens).
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens))
    } catch {
      /* sem armazenamento disponível: segue sem salvar */
    }
  }, [itens])

  // useMemo: guarda um cálculo e só o refaz se as dependências mudarem.
  const bairros = useMemo(() => {
    const contagem = {}
    itens.forEach((i) => {
      contagem[i.bairro] = (contagem[i.bairro] || 0) + 1
    })
    return Object.keys(contagem)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((nome) => ({ nome, qtd: contagem[nome] }))
  }, [itens])

  const visiveis = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    return itens
      .filter((i) => !bairro || i.bairro === bairro)
      .filter((i) => !termo || Object.values(i).join(' ').toLowerCase().includes(termo))
      .sort((a, b) => comparar(a, b, ordem))
  }, [itens, bairro, busca, ordem])

  const totalUnidades = visiveis.reduce((soma, i) => soma + i.quantidade, 0)

  function ordenarPor(chave) {
    // mesma coluna: inverte a direção; coluna nova: começa crescente
    setOrdem((o) => (o.chave === chave ? { chave, dir: -o.dir } : { chave, dir: 1 }))
  }

  return (
    <main>
      <h1>Painel de Cotação</h1>

      <div className="barra">
        <FileLoader
          temDados={itens.length > 0}
          onCarregar={(novos) => {
            setItens(novos)
            setBairro('')
          }}
        />
        <input
          type="search"
          placeholder="Buscar produto, fabricante ou código"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {itens.length === 0 ? (
        <p className="vazio">
          Nenhuma planilha carregada. Toque em “Carregar planilha” e escolha o arquivo do mês.
        </p>
      ) : (
        <>
          <BairroFilter
            bairros={bairros}
            selecionado={bairro}
            total={itens.length}
            onSelecionar={setBairro}
          />
          <p className="resumo">
            <b>{visiveis.length}</b> itens · <b>{totalUnidades}</b> unidades
          </p>
          <DataTable itens={visiveis} colunas={COLUNAS} ordem={ordem} onOrdenar={ordenarPor} />
        </>
      )}
    </main>
  )
}
