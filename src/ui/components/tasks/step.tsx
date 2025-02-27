export function Step({ options, setSelected }: StepProps) {
  return (
    <div className="flex flex-wrap flex-row gap-2">
      {options.map(v => (
        <p
          key={v.id}
          onMouseDown={() => setSelected(v.id)}
          className="hover:underline hover:cursor-pointer font-bold"
        >
          {v.name}
        </p>
      ))}
    </div>
  )
}

type StepProps = {
  options: { id: number, name: string }[]
  setSelected: (id: number) => void
}
