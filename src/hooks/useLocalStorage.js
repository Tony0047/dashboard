import { useEffect, useState } from 'react'

// "Hook personalizado": funciona como useState, mas guarda o valor no aparelho.
// Ao reabrir o app, os dados (planilhas, preços, anotações) continuam lá.
export default function useLocalStorage(chave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const salvo = localStorage.getItem(chave)
      return salvo ? JSON.parse(salvo) : inicial
    } catch {
      return inicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      /* sem armazenamento disponível: segue sem salvar */
    }
  }, [chave, valor])

  return [valor, setValor]
}
