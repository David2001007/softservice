import { useState } from 'react'
import { Check } from 'lucide-react'

export function CopyableOsNumber({ numero, asQuotes }: { numero: string, asQuotes?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(numero)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span className="relative inline-flex items-center">
      <strong
        onClick={handleCopy}
        className={`cursor-pointer transition-all duration-200 flex items-center gap-1 ${
          copied ? 'text-success no-underline' : 'underline hover:text-primary text-primary'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider font-bold">Copiado!</span>
          </>
        ) : (
          asQuotes ? `"${numero}"` : numero
        )}
      </strong>
    </span>
  )
}
