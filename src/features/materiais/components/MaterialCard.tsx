import { Hash, AlertTriangle } from 'lucide-react'
import { formatNumber, getEstoqueUnidadeLabel } from '@/lib/utils'

interface MaterialCardProps {
  material: any
}

export function MaterialCard({ material }: MaterialCardProps) {
  const isEstoqueBaixo = Number(material.quantidade) <= Number(material.estoqueMinimo ?? 0)
  const unidadeLabel = getEstoqueUnidadeLabel(material)

  return (
    <div className={`bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors ${isEstoqueBaixo ? 'border-red-500/50 bg-red-500/5' : 'border-border'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base line-clamp-2" title={material.descricao}>
            {material.descricao}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-mono flex-wrap">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />
              {material.codigo}
            </span>
            {material.assignedTecnicoId && material.tecnico && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-sans font-medium text-[10px] uppercase tracking-wider">
                {material.tecnico.nome}
              </span>
            )}
          </div>
        </div>
        {isEstoqueBaixo && (
          <div className="shrink-0 ml-2" title="Estoque baixo">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      <hr className={`border-dashed ${isEstoqueBaixo ? 'border-red-500/20' : 'border-border'}`} />

      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs text-muted-foreground block mb-0.5">Em Estoque</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${isEstoqueBaixo ? 'text-red-600' : 'text-primary'}`}>
              {formatNumber(material.quantidade)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{unidadeLabel}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground block mb-0.5">Est. Mínimo</span>
          <span className="text-sm font-semibold">{formatNumber(material.estoqueMinimo || 0)} {unidadeLabel}</span>
        </div>
      </div>
    </div>
  )
}
