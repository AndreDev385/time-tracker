import { Check } from "lucide-react";

export function FinishedOtherTask({ task }: Props) {
  return (
    <div className="flex justify-between p-4 border border-gray-300 rounded-lg">

      <div>
        <p className="font-bold">{task.comment}</p>
      </div>
      <div>
        <Check className="text-green-500" />
      </div>
    </div>
  )
}

type Props = {
  task: OtherTask;
}
