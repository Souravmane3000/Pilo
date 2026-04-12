import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8 text-center">
      <Icon className="mb-3 h-8 w-8 text-zinc-500" aria-hidden="true" />
      <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:bg-zinc-700"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
