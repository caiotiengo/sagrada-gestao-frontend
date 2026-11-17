import { cn } from '@/lib/utils'

/** Logo de três camadas do Sagrada Gestão (o mesmo do app e do login). */
export function BrandMark({ className, tone = 'indigo' }: { className?: string; tone?: 'indigo' | 'gold' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl shadow-lg',
        tone === 'indigo' ? 'bg-[#3e42b6] text-white shadow-[#3e42b6]/25' : 'bg-sg-gold text-[#1b1c45] shadow-black/20',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[55%]"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5Z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </span>
  )
}

/**
 * Fio de contas reto (divisor). Cores sempre misturadas e nunca em círculo
 * fechado, como pede o brand kit (seção 8).
 */
export function BeadLine({ className, count = 24 }: { className?: string; count?: number }) {
  const colors = ['#c9913c', '#f4ebda', '#a4522f', '#4e8a4a', '#f4ebda', '#6e3320', '#e8c27a', '#8db86a']
  const step = 20
  const width = count * step
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} 14`}
      className={cn('h-3.5 w-auto max-w-full', className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1="0" y1="7" x2={width} y2="7" stroke="#d9cbb0" strokeOpacity="0.6" strokeWidth="1" />
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={step * i + step / 2} cy="7" r="5.5" fill={colors[i % colors.length]} />
      ))}
    </svg>
  )
}

/** Ramo de folhas genérico para canto (ilustração botânica, sem uso ritual). */
export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 160" className={className} fill="none">
      <path d="M60 158C58 120 52 80 30 30" stroke="#2e5a37" strokeWidth="3" strokeLinecap="round" />
      <path d="M55 120C35 112 22 98 18 80c18 2 32 14 37 40Z" fill="#4e8a4a" />
      <path d="M53 96c16-10 30-12 44-8-6 14-22 22-44 8Z" fill="#8db86a" />
      <path d="M45 70C28 60 20 46 20 30c16 6 26 20 25 40Z" fill="#4e8a4a" />
      <path d="M41 56c12-12 26-16 40-14-4 14-20 22-40 14Z" fill="#2e5a37" />
      <path d="M33 38c-2-14 2-26 10-34 6 12 4 24-10 34Z" fill="#8db86a" />
    </svg>
  )
}
