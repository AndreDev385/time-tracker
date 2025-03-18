import { GripVertical } from "lucide-react";
import { Button } from "../components/shared/button";

export function Draggable() {
  return (
    <div className='flex items-center'>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 hover:bg-primary/10"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ "app-region": "drag" } as any}
      >
        <GripVertical className='size-5' />
      </Button >
    </div>
  )
}
