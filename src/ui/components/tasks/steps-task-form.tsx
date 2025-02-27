import React from "react"
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import { FormState } from "../../pages/tasks";
import { ArrowLeft } from "lucide-react";
import { CollisionModal } from "./collision-modal";
import { Step } from "./step";

export function StepsTaskForm({
  formState,
  onFormStateChange,
  handleSubmitTask,
  collisionModal,
  setCollisionModal,
  user,
  createTaskInfo,
  showOtherTaskForm,
}: Props) {
  const [recordIdError, setRecordIdError] = React.useState("")
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);


  const steps = [
    {
      options: createTaskInfo.projects.filter(p => p.id !== formState.selectedProject),
      setSelected: (id: number) => {
        onFormStateChange("selectedProject", id)
        onFormStateChange("step", 1)
      }
    },
    {
      options: createTaskInfo.taskTypes,
      setSelected: (id: number) => {
        // validate recordId
        if (formState.recordId.trim() === "") {
          setRecordIdError("Debe ingresar un expediente")
          return
        } else setRecordIdError("")
        // 
        setSelectedValues([...selectedValues, createTaskInfo.taskTypes.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedTaskType", id)
        onFormStateChange("step", 2)
      }
    },
    {
      options: createTaskInfo.business,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.business.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedBusiness", id)
        onFormStateChange("step", 3)
      }
    },
    {
      options: createTaskInfo.recordTypes,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.recordTypes.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedRecordType", id)
        handleSubmitTask({
          userId: user.id,
          projectId: Number(formState.selectedProject),
          taskTypeId: Number(formState.selectedTaskType),
          businessId: Number(formState.selectedBusiness),
          recordTypeId: Number(id),
          recordId: formState.recordId,
        })
      }
    },
  ]

  function renderStep(step: number) {
    if (step === 1) {
      return (
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <Input
              value={formState.recordId}
              onChange={(e) => onFormStateChange("recordId", e.target.value)}
              name="recordId"
              placeholder="Expediente"
            />
            {recordIdError ? <em className="text-red-500">{recordIdError}</em> : null}
          </div>
          <div className="flex justify-between w-full items-center gap-4">
            <Step {...steps[step]} />
            <p
              className="hover:underline hover:cursor-pointer font-bold"
              onMouseDown={() => showOtherTaskForm()}
            >
              Otras tareas
            </p>
          </div>
        </div>
      )
    } else if (step < steps.length) {
      return (
        <div className="flex justify-between w-full items-center gap-4">
          <Step {...steps[step]} />
          <div>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-lg"
              onMouseDown={() => {
                setSelectedValues(selectedValues.splice(0, selectedValues.length - 1))
                onFormStateChange("step", formState.step - 1)
              }}
            >
              <ArrowLeft className="size-6" />
            </Button>
          </div>
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <>
      {/* collision modal */}
      <CollisionModal state={collisionModal} setState={setCollisionModal} submit={() =>
        handleSubmitTask({
          userId: user.id,
          projectId: Number(formState.selectedProject),
          taskTypeId: Number(formState.selectedTaskType),
          businessId: Number(formState.selectedBusiness),
          recordTypeId: Number(formState.selectedRecordType),
          recordId: formState.recordId,
        }, true)
      } />
      <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
        {/* PROJECT step 0 */}
        <div className="flex gap-4">
          {selectedValues.map(v => (
            <p key={v} className="text-sm font-bold text-blue-500">{v}</p>
          ))}
        </div>
        {renderStep(formState.step)}
      </div>
    </>
  )
}

type Props = {
  formState: FormState
  onFormStateChange: (name: keyof FormState, value: FormState[keyof FormState]) => void
  handleSubmitTask: (createTaskFormData: CreateTaskFormData, confirmation?: boolean) => void
  collisionModal: { open: boolean }
  setCollisionModal: React.Dispatch<React.SetStateAction<{ open: boolean }>>
  user: JWTTokenData
  createTaskInfo: CreateTaskInfo
  showOtherTaskForm: () => void
}

