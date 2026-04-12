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

export default function ExampleGoals({ onSelect }: ExampleGoalsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLE_GOALS.map((goal) => (
        <button
          key={goal}
          type="button"
          onClick={() => onSelect(goal)}
          className="cursor-pointer rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 transition-all duration-200 hover:bg-zinc-700"
        >
          {goal}
        </button>
      ))}
    </div>
  )
}