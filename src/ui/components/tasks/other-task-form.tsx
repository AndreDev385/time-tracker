import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shared/select";
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import { OtherTaskFormState } from "../../pages/tasks";

export function OtherTaskForm({
  otherTaskForm,
  setOtherTaskForm,
  options,
  initialState,
  userId,
  loading,
  setLoading,
}: Props) {

  function handleSubmitOtherTask(comment: string, defaultOptionId?: number) {
    setLoading(true)
    window.electron.createOtherTaskSubmit({
      userId,
      defaultOptionId,
      comment,
    })
  }

  return (
    <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Select
            value={otherTaskForm.label}
            onValueChange={(v) => setOtherTaskForm(prev => {
              if (v === "custom") {
                return { ...prev, custom: true, label: v, comment: "", defaultOption: undefined }
              }
              const option = options.find(o => o.value === v)
              return { ...prev, comment: v, defaultOption: option!.id, custom: false, label: v }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opcion" />
            </SelectTrigger>
            <SelectContent>
              {
                options.map(o => (
                  <SelectItem key={o.id} value={o.value}>{o.value}</SelectItem>
                ))
              }
              <SelectItem value="custom">Otra tarea</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            onMouseDown={() => setOtherTaskForm(initialState)}
            disabled={loading}
          >
            {
              loading ? (
                <Loader2 className="animate-spin size-10" />
              ) : (
                <ArrowLeft className="size-6" />
              )
            }
          </Button>
          <Button
            size="icon"
            onMouseDown={() => handleSubmitOtherTask(otherTaskForm.comment, otherTaskForm.defaultOption)}
            disabled={otherTaskForm.comment.trim() === "" || loading}
          >
            {
              loading ? (
                <Loader2 className="animate-spin size-10" />
              ) : (
                <ArrowRight className="size-6" />
              )
            }
          </Button>
        </div>
        {
          otherTaskForm.custom ? (
            <Input
              value={otherTaskForm.comment}
              onChange={(e) => setOtherTaskForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Ingresa la tarea"
            />
          ) : null
        }
      </div>
    </div>
  )
}

type Props = {
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  otherTaskForm: OtherTaskFormState
  setOtherTaskForm: React.Dispatch<React.SetStateAction<OtherTaskFormState>>
  options: CreateTaskInfo["otherTaskOptions"]
  initialState: OtherTaskFormState
  userId: number
}
