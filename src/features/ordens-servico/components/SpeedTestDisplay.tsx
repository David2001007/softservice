import { Wifi } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

interface SpeedTestDisplayProps {
  download?: string | number | null
  upload?: string | number | null
  dataHora?: string | Date | null
  compact?: boolean
}

export function SpeedTestDisplay({
  download,
  upload,
  dataHora,
  compact = false,
}: SpeedTestDisplayProps) {
  if (download == null && upload == null) return null

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground items-center bg-muted/50 py-2 px-3 rounded-lg border border-border/50">
        <span className="text-green-500 flex items-center gap-1.5 shrink-0">
          <Wifi className="w-3.5 h-3.5" /> Teste de Conexão
        </span>
        <div className="hidden sm:block w-px h-3 bg-border" />
        <span className="shrink-0">↓ {formatNumber(download)}Mbps</span>
        <div className="hidden sm:block w-px h-3 bg-border" />
        <span className="shrink-0">↑ {formatNumber(upload)}Mbps</span>
        {dataHora && (
          <>
            <div className="hidden sm:block w-px h-3 bg-border" />
            <span className="shrink-0">
              {formatDate(dataHora, { time: true })}
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-3 rounded-lg bg-background border border-border text-center">
        <p className="text-xs text-text-muted uppercase tracking-wider">Download</p>
        <p className="text-lg font-bold mt-1">{formatNumber(download)} Mbps</p>
      </div>
      <div className="p-3 rounded-lg bg-background border border-border text-center">
        <p className="text-xs text-text-muted uppercase tracking-wider">Upload</p>
        <p className="text-lg font-bold mt-1">{formatNumber(upload)} Mbps</p>
      </div>
      <div className="p-3 rounded-lg bg-background border border-border text-center col-span-2 sm:col-span-1">
        <p className="text-xs text-text-muted uppercase tracking-wider">Realizado em</p>
        <p className="text-sm font-medium mt-1">
          {dataHora ? formatDate(dataHora, { time: true }) : '—'}
        </p>
      </div>
    </div>
  )
}

export function parseSpeedTestFromOs(os: {
  speedTestDownload?: string | number | null
  speedTestUpload?: string | number | null
  speedTestDataHora?: string | Date | null
}) {
  if (os.speedTestDownload == null || os.speedTestUpload == null) return null

  return {
    download: Number(os.speedTestDownload),
    upload: Number(os.speedTestUpload),
    dataHora: os.speedTestDataHora
      ? new Date(os.speedTestDataHora).toISOString()
      : new Date().toISOString(),
  }
}
