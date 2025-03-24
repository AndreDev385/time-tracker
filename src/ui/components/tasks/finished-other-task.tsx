export function FinishedOtherTask({ task }: Props) {
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <p className="text-green-600 text-xs">{task.comment}</p>
    </div>
  )
}

type Props = {
  task: OtherTask;
}
