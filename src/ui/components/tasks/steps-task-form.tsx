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
  oneAssignedProject
}: Props) {
  const [recordIdError, setRecordIdError] = React.useState("")
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  const steps = [
    {
      message: "No tienes projectos assignados",
      options: createTaskInfo.projects,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.projects.find(p => p.id === id)!.name as string])
        onFormStateChange("selectedProject", id)
        onFormStateChange("step", 1)
      }
    },
    {
      message: "No hay tipos de trabajo registrados",
      options: createTaskInfo.workTypes,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.workTypes.find(wt => wt.id === id)!.name as string])
        onFormStateChange("selectedWorkType", id)
        onFormStateChange("step", 2)
      }
    },
    {
      message: "No hay tipos de tarea registrados",
      options: createTaskInfo.taskTypes.filter(function workTypeOptions(tp) {
        const workType = createTaskInfo.workTypes.find(wt => formState.selectedWorkType === wt.id)
        return workType?.taskTypes.includes(tp.id)
      }),
      setSelected: (id: number) => {
        // validate recordId
        if (formState.recordId.trim() === "") {
          setRecordIdError("Debe ingresar un expediente")
          return
        } else setRecordIdError("")
        // 
        setSelectedValues([...selectedValues, createTaskInfo.taskTypes.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedTaskType", id)
        onFormStateChange("step", 3)
      }
    },
    {
      message: "No hay empresas registradas",
      options: createTaskInfo.business,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.business.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedBusiness", id)
        onFormStateChange("step", 4)
      }
    },
    {
      message: "No hay tipos de expedientes registrados",
      options: createTaskInfo.recordTypes,
      setSelected: (id: number) => {
        setSelectedValues([...selectedValues, createTaskInfo.recordTypes.find(t => t.id === id)!.name as string])
        onFormStateChange("selectedRecordType", id)
        handleSubmitTask({
          userId: user.id,
          projectId: Number(formState.selectedProject),
          taskTypeId: Number(formState.selectedTaskType),
          businessId: Number(formState.selectedBusiness),
          workTypeId: Number(formState.selectedWorkType),
          recordTypeId: Number(id),
          recordId: formState.recordId,
        })
      }
    },
  ]

  function StepBackButton() {
    return (
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
    )
  }

  function renderStep(step: number) {
    if (step === 1) {
      return (<div className="flex justify-between w-full items-center gap-4">
        <div className="flex justify-between w-full items-center gap-4">
          <Step {...steps[step]} />
        </div>
        <div className="w-36">
          <p
            className="hover:underline hover:cursor-pointer font-bold text-end"
            onMouseDown={() => showOtherTaskForm()}
          >
            Otras tareas
          </p>
        </div>
        <div>
          {!oneAssignedProject ? (
            <StepBackButton />
          ) : null}
        </div>
      </div>)
    }
    if (step === 2) {
      return (
        <div className="flex gap-4">
          <div>
            <Input
              value={formState.recordId}
              onChange={(e) => onFormStateChange("recordId", e.target.value)}
              name="recordId"
              className="w-44"
              placeholder="Expediente"
            />
            {recordIdError ? <em className="text-red-500">{recordIdError}</em> : null}
          </div>
          <Step {...steps[step]} />
          <div>
            <StepBackButton />
          </div>
        </div>
      )
    } else if (step < steps.length) {
      return (
        <div className="flex justify-between w-full items-center gap-4">
          <Step {...steps[step]} />
          <div>
            {step > 0 ? (
              <StepBackButton />
            ) : null}
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
          workTypeId: Number(formState.selectedWorkType),
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
  oneAssignedProject: boolean;
}

