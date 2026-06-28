import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

interface Tecnico {
  id: number
  nome: string
}

interface TecnicoAutocompleteProps {
  tecnicos: Tecnico[]
  value: number | null
  onChange: (tecnicoId: number | null) => void
  placeholder?: string
  allowEmpty?: boolean
  emptyLabel?: string
}

export function TecnicoAutocomplete({
  tecnicos,
  value,
  onChange,
  placeholder = 'Digite o nome do técnico...',
  allowEmpty = true,
  emptyLabel = 'Nenhum (estoque principal)',
}: TecnicoAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selectedTecnico = useMemo(
    () => tecnicos.find((t) => t.id === value) ?? null,
    [tecnicos, value],
  )

  useEffect(() => {
    if (selectedTecnico) {
      setSearch(selectedTecnico.nome)
    }
  }, [selectedTecnico?.id, selectedTecnico?.nome])

  const filteredTecnicos = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tecnicos
    return tecnicos.filter((t) => t.nome.toLowerCase().includes(query))
  }, [search, tecnicos])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        if (selectedTecnico) {
          setSearch(selectedTecnico.nome)
        } else if (!value) {
          setSearch('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedTecnico, value])

  const handleSelect = (tecnico: Tecnico | null) => {
    onChange(tecnico?.id ?? null)
    setSearch(tecnico?.nome ?? '')
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSearch('')
    setOpen(false)
  }

  const showDropdown =
    open &&
    (filteredTecnicos.length > 0 || (allowEmpty && search.trim().length === 0))

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
            if (!e.target.value.trim()) {
              onChange(null)
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(inputCls, 'pr-8')}
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            aria-label="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {allowEmpty && search.trim().length === 0 && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full text-left px-3 py-2.5 hover:bg-background transition-colors border-b border-border text-sm text-text-muted',
                value === null && 'bg-background',
              )}
            >
              {emptyLabel}
            </button>
          )}
          {filteredTecnicos.map((tecnico) => (
            <button
              key={tecnico.id}
              type="button"
              onClick={() => handleSelect(tecnico)}
              className={cn(
                'w-full text-left px-3 py-2.5 hover:bg-background transition-colors border-b border-border last:border-b-0 text-sm',
                value === tecnico.id && 'bg-background font-medium',
              )}
            >
              {tecnico.nome}
            </button>
          ))}
          {filteredTecnicos.length === 0 && search.trim().length > 0 && (
            <p className="px-3 py-2.5 text-sm text-text-muted">
              Nenhum técnico encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
