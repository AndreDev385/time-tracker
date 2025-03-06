import { Check } from "lucide-react";

export function FinishedTask({ task }: Props) {
  return (
    <div className="flex justify-between p-4 border border-gray-300 rounded-lg">

      <div>
        <p className="font-semibold">Expediente: {task.recordId}</p>
      </div>
      <div>
        <Check className="text-green-500" />
      </div>
    </div>
  )
}

type Props = {
  task: Task;
}
