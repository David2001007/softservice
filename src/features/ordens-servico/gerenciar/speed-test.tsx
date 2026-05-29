import { useState, useEffect, useCallback } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  ArrowDown,
  ArrowUp,
  Activity,
} from 'lucide-react'
import { DefaultButton } from '@/components/default-button'
import { speedTestPing, speedTestDownload, speedTestUpload } from '../server'

/* ── Types ── */
export interface SpeedTestResults {
  ping: number
  download: number
  upload: number
  dataHora: string
}

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done'

interface SpeedTestProps {
  onConfirm: (results: SpeedTestResults) => void
  onCancel: () => void
  initialResults?: SpeedTestResults | null
}

/* ── Thresholds ── */
const THRESHOLDS = {
  ping: { good: 50, unit: 'ms', goodWhen: 'below' as const },
  download: { good: 10, unit: 'Mbps', goodWhen: 'above' as const },
  upload: { good: 5, unit: 'Mbps', goodWhen: 'above' as const },
}

function isGood(metric: keyof typeof THRESHOLDS, value: number): boolean {
  const t = THRESHOLDS[metric]
  return t.goodWhen === 'below' ? value < t.good : value >= t.good
}

/* ── Component ── */
export function SpeedTest({
  onConfirm,
  onCancel,
  initialResults,
}: SpeedTestProps) {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [pingResult, setPingResult] = useState<number | null>(
    initialResults?.ping ?? null,
  )
  const [downloadResult, setDownloadResult] = useState<number | null>(
    initialResults?.download ?? null,
  )
  const [uploadResult, setUploadResult] = useState<number | null>(
    initialResults?.upload ?? null,
  )
  const [testDateTime, setTestDateTime] = useState<string>(
    initialResults?.dataHora ?? '',
  )
  const [error, setError] = useState<string | null>(null)

  const runTest = useCallback(async () => {
    setError(null)
    setPingResult(null)
    setDownloadResult(null)
    setUploadResult(null)
    setTestDateTime('')

    try {
      // ── PING ──
      setPhase('ping')
      const pingTimes: number[] = []
      for (let i = 0; i < 3; i++) {
        const start = performance.now()
        await speedTestPing()
        const end = performance.now()
        pingTimes.push(end - start)
      }
      const avgPing = Math.round(
        pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length,
      )
      setPingResult(avgPing)

      // ── DOWNLOAD ──
      setPhase('download')
      const dlStart = performance.now()
      await speedTestDownload()
      const dlEnd = performance.now()
      const dlTimeSeconds = (dlEnd - dlStart) / 1000
      const dlMbps = parseFloat(((10 * 8) / dlTimeSeconds).toFixed(2))
      setDownloadResult(dlMbps)

      // ── UPLOAD ──
      setPhase('upload')
      const payloadString = '0'.repeat(10 * 1024 * 1024)
      const ulStart = performance.now()
      await speedTestUpload({ data: { payload: payloadString } })
      const ulEnd = performance.now()
      const ulTimeSeconds = (ulEnd - ulStart) / 1000
      const ulMbps = parseFloat(((10 * 8) / ulTimeSeconds).toFixed(2))
      setUploadResult(ulMbps)

      setTestDateTime(new Date().toISOString())
      setPhase('done')
    } catch (err) {
      console.error('Speed test error:', err)
      setError(
        'Erro ao executar o teste. Verifique a conexão e tente novamente.',
      )
      setPhase('done')
    }
  }, [])

  // Auto-start on mount (only if no initial results)
  useEffect(() => {
    if (!initialResults) {
      runTest()
    } else {
      setPhase('done')
    }
  }, [])

  const handleConfirm = () => {
    if (pingResult != null && downloadResult != null && uploadResult != null) {
      onConfirm({
        ping: pingResult,
        download: downloadResult,
        upload: uploadResult,
        dataHora: testDateTime,
      })
    }
  }

  const allDone =
    phase === 'done' &&
    pingResult != null &&
    downloadResult != null &&
    uploadResult != null

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Wifi className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Speed Test</h3>
          <p className="text-xs text-muted-foreground">
            Teste de velocidade da conexão Wi-Fi do cliente
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-3 gap-3">
        <PhaseCard
          label="Ping"
          icon={Activity}
          isActive={phase === 'ping'}
          isDone={pingResult != null}
          value={pingResult}
          unit="ms"
          metric="ping"
        />
        <PhaseCard
          label="Download"
          icon={ArrowDown}
          isActive={phase === 'download'}
          isDone={downloadResult != null}
          value={downloadResult}
          unit="Mbps"
          metric="download"
        />
        <PhaseCard
          label="Upload"
          icon={ArrowUp}
          isActive={phase === 'upload'}
          isDone={uploadResult != null}
          value={uploadResult}
          unit="Mbps"
          metric="upload"
        />
      </div>

      {/* Running Indicator */}
      {phase !== 'idle' && phase !== 'done' && (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="speed-test-spinner" />
          <span className="text-sm text-muted-foreground">
            {phase === 'ping' && 'Medindo latência...'}
            {phase === 'download' && 'Testando download (10MB)...'}
            {phase === 'upload' && 'Testando upload (10MB)...'}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
          <WifiOff className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <DefaultButton variant="ghost" label="Cancelar" onClick={onCancel} />
        <DefaultButton
          variant="ghost"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          label="Testar novamente"
          onClick={runTest}
          disabled={phase !== 'done' && phase !== 'idle'}
        />
        <DefaultButton
          leftIcon={<Check className="w-4 h-4" />}
          label="Confirmar"
          disabled={!allDone}
          onClick={handleConfirm}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
        />
      </div>
    </div>
  )
}

/* ── Phase Card ── */
interface PhaseCardProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  isDone: boolean
  value: number | null
  unit: string
  metric: 'ping' | 'download' | 'upload'
}

function PhaseCard({
  label,
  icon: Icon,
  isActive,
  isDone,
  value,
  unit,
  metric,
}: PhaseCardProps) {
  const good = value != null ? isGood(metric, value) : null

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isActive
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : isDone
            ? 'border-border bg-card'
            : 'border-border/50 bg-card/50 opacity-60'
      }`}
    >
      {/* Active glow */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative flex flex-col items-center gap-2 text-center">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isActive
              ? 'bg-primary/20 text-primary'
              : isDone && good
                ? 'bg-green-500/20 text-green-500'
                : isDone && !good
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>

        {isDone && value != null ? (
          <>
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground -mt-1">{unit}</span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                good
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              {good ? '✓ Bom' : '✗ Ruim'}
            </span>
          </>
        ) : isActive ? (
          <div className="h-8 flex items-center">
            <div className="speed-test-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <span className="text-lg text-muted-foreground/50">—</span>
        )}
      </div>
    </div>
  )
}
