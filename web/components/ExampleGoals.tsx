import React from 'react'

type ExampleGoalsProps = {
  onSelect: (goal: string) => void
}

const EXAMPLE_GOALS: string[] = [
  'Follow up with inactive leads',
  'Send intro email to new leads',
  'Update CRM for qualified leads',
  'Get all new leads from last week',
]

export default function ExampleGoals({ onSelect }: ExampleGoalsProps): React.ReactNode {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {EXAMPLE_GOALS.map((goal) => (
        <button
          key={goal}
          type="button"
          onClick={() => onSelect(goal)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-green-400/30 hover:bg-green-500/10 active:scale-[0.98]"
        >
          {goal}
        </button>
      ))}
    </div>
  )
}