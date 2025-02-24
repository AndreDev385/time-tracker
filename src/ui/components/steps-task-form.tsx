import React from "react"
import { Button } from "./shared/button";
import { Input } from "./shared/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/shared/dialog"
import { FormState } from "../pages/tasks";

export function StepsTaskForm({
  formState,
  onFormStateChange,
  ONE_ASSIGNED_PROJECT,
  handleSubmitTask,
  collisionModal,
  setCollisionModal,
  user,
  projects,
  businesses,
  taskTypes,
  recordTypes
}: Props) {


  const steps = [
    {
      options: projects.filter(p => p.id !== formState.selectedProject),
      setSelected: (id: number) => {
        onFormStateChange("selectedProject", id)
        onFormStateChange("step", 1)
      }
    },
    {
      options: taskTypes,
      setSelected: (id: number) => {
        onFormStateChange("selectedTaskType", id)
        onFormStateChange("step", 2)
      }
    },
    {
      options: [],
      setSelected: () => { }
    },
    {
      options: businesses,
      setSelected: (id: number) => {
        onFormStateChange("selectedBusiness", id)
        onFormStateChange("step", 4)
      }
    },
    {
      options: recordTypes,
      setSelected: (id: number) => {
        onFormStateChange("selectedRecordType", id)
        onFormStateChange("step", 5)
      }
    },
  ]

  const messages = [
    "Selecciona un proyecto",
    "Selecciona un tipo de tarea",
    "Ingresa el N° de expediente",
    "Selecciona una empresa",
    "Selecciona un tipo de expediente",
    "Confirmar selección",
  ]

  function renderStep(step: number) {
    if (step === 2) {
      return (
        <div>
          <Input
            value={formState.recordId}
            onChange={(e) => onFormStateChange("recordId", e.target.value)}
            name="recordId"
            placeholder="Expediente"
          />
        </div>
      )
    } else if (step < steps.length) {
      return <Step {...steps[step]} />
    } else {
      return null
    }
  }

  // TODO: validate record id
  const INPUT_STEP = 2
  const INSERT_RECORD_ID_STEP = formState.step === INPUT_STEP && formState.recordId.trim() !== "";
  const SELECTING_PROPERTIES = formState.step < steps.length
  const DISABLE_BUTTON = INSERT_RECORD_ID_STEP ? false : SELECTING_PROPERTIES

  return (
    <>
      <Dialog open={collisionModal.open} onOpenChange={(open) => setCollisionModal({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Este expediente ya existe</DialogTitle>
            <DialogDescription>
              Si continuas el tiempo dedicado a este expediente por el usuario anterior sera marcado como no productivo.
              Estas seguro que quieres continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onMouseDown={() => setCollisionModal({ open: false })}
              variant="destructive"
            >
              Cancelar
            </Button>
            <Button
              onMouseDown={() => {
                setCollisionModal({ open: false })
                handleSubmitTask({
                  userId: user.id,
                  projectId: Number(formState.selectedProject),
                  taskTypeId: Number(formState.selectedTaskType),
                  businessId: Number(formState.selectedBusiness),
                  recordTypeId: Number(formState.selectedRecordType),
                  recordId: formState.recordId,
                }, true)
              }}
              variant="default"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
        <h1 className="text-muted-foreground text-lg">Nueva tarea - {messages[formState.step]}</h1>
        {/* PROJECT step 0 */}
        {
          formState.step < steps.length ? (
            <>
              {renderStep(formState.step)}
            </>
          )
            : (
              <div>
                <div className="flex justify-between">
                  <p><strong>Proyecto:</strong></p>
                  <p>{projects.find(p => p.id === formState.selectedProject)?.name}</p>
                </div>
                <div className="flex justify-between">
                  <p><strong>Tipo de tarea:</strong></p>
                  <p>{taskTypes.find(p => p.id === formState.selectedTaskType)?.name}</p>
                </div>
                <div className="flex justify-between">
                  <p><strong>Empresa:</strong></p>
                  <p>{businesses.find(p => p.id === formState.selectedBusiness)?.name}</p>
                </div>
                <div className="flex justify-between">
                  <p><strong>Tipo expediente:</strong></p>
                  <p>{recordTypes.find(p => p.id === formState.selectedRecordType)?.name}</p>
                </div>
              </div>
            )
        }
        <div className="flex gap-4 justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onFormStateChange("step", formState.step - 1)}
            disabled={ONE_ASSIGNED_PROJECT ? formState.step === 1 : formState.step === 0}
          >
            Atrás
          </Button>
          <Button
            size="sm"
            disabled={DISABLE_BUTTON}
            onMouseDown={() => {
              if (formState.step === 2) {
                onFormStateChange("step", 3)
              } else {
                return handleSubmitTask({
                  userId: user.id,
                  projectId: Number(formState.selectedProject),
                  taskTypeId: Number(formState.selectedTaskType),
                  businessId: Number(formState.selectedBusiness),
                  recordTypeId: Number(formState.selectedRecordType),
                  recordId: formState.recordId,
                })
              }
            }}
          >
            Aceptar
          </Button>
        </div>
      </div>
    </>
  )
}

type Props = {
  formState: FormState
  onFormStateChange: (name: keyof FormState, value: FormState[keyof FormState]) => void
  ONE_ASSIGNED_PROJECT: boolean
  handleSubmitTask: (createTaskFormData: CreateTaskFormData, confirmation?: boolean) => void
  collisionModal: { open: boolean }
  setCollisionModal: React.Dispatch<React.SetStateAction<{ open: boolean }>>
  user: JWTTokenData
  projects: Project[]
  businesses: Business[]
  taskTypes: TaskType[]
  recordTypes: RecordType[]
}

function Step({ options, setSelected }: StepProps) {
  return (
    <div className="flex flex-wrap flex-row gap-2">
      {options.map(v => (
        <Button
          key={v.id}
          size="sm"
          onMouseDown={() => setSelected(v.id)}
        >
          {v.name}
        </Button>
      ))}
    </div>
  )
}

type StepProps = {
  options: { id: number, name: string }[]
  setSelected: (id: number) => void
}
