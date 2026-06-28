import { useState, useMemo } from 'react'
import { MaterialCard } from './MaterialCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface MaterialCardListProps {
  data: any[]
}

export function MaterialCardList({ data }: MaterialCardListProps) {
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!search) return data
    const lowerSearch = search.toLowerCase()
    return data.filter((material) => {
      return (
        material.descricao?.toLowerCase().includes(lowerSearch) ||
        material.codigo?.toLowerCase().includes(lowerSearch)
      )
    })
  }, [data, search])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar material por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 rounded-xl bg-card border-border shadow-sm w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredData.length > 0 ? (
          filteredData.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            Nenhum material encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
