import { useState, useMemo } from 'react'
import { OrdemServicoCard } from './OrdemServicoCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface OrdemServicoCardListProps {
  data: any[]
}

export function OrdemServicoCardList({ data }: OrdemServicoCardListProps) {
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!search) return data
    const lowerSearch = search.toLowerCase()
    return data.filter((os) => {
      return (
        os.numero?.toLowerCase().includes(lowerSearch) ||
        os.cliente?.nome?.toLowerCase().includes(lowerSearch) ||
        os.tipoServico?.toLowerCase().includes(lowerSearch)
      )
    })
  }, [data, search])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por OS, cliente ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 rounded-xl bg-card border-border shadow-sm w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredData.length > 0 ? (
          filteredData.map((os) => (
            <OrdemServicoCard key={os.id} os={os} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            Nenhuma ordem de serviço encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
