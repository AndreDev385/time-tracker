import React from "react"
import { Button } from "./shared/button";
import { Input } from "./shared/input";

export function StepsTaskForm({
  handleSubmitTask,
  user,
  projects,
  businesses,
  taskTypes,
  recordTypes
}: Props) {


  const ONE_ASSIGNED_PROJECT = user.assignedProjects ? user.assignedProjects.length === 1 : false;

  const [recordId, setRecordId] = React.useState<string>("")
  const [selectedProject, setSelectedProject] = React.useState<Project['id'] | null>(ONE_ASSIGNED_PROJECT ? user.assignedProjects![0] : null)
  const [selectedBusiness, setSelectedBusiness] = React.useState<Business['id']>()
  const [selectedTaskType, setSelectedTaskType] = React.useState<TaskType['id']>()
  const [selectedRecordType, setSelectedRecordType] = React.useState<RecordType['id']>()

  const [step, setStep] = React.useState<number>(ONE_ASSIGNED_PROJECT ? 1 : 0)

  const steps = [
    {
      options: projects.filter(p => p.id !== selectedProject),
      setSelected: (id: number) => {
        setSelectedProject(id)
        setStep(1)
      }
    },
    {
      options: taskTypes,
      setSelected: (id: number) => {
        setSelectedTaskType(id)
        setStep(2)
      }
    },
    {
      options: [],
      setSelected: () => { }
    },
    {
      options: businesses,
      setSelected: (id: number) => {
        setSelectedBusiness(id)
        setStep(4)
      }
    },
    {
      options: recordTypes,
      setSelected: (id: number) => {
        setSelectedRecordType(id)
        setStep(5)
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
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
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
  const INSERT_RECORD_ID_STEP = step === 2 && recordId.trim() !== "";
  const SELECTING_PROPERTIES = (step === steps.length - 1 || !selectedProject || !selectedTaskType || !selectedBusiness || !selectedRecordType)
  const DISABLE_BUTTON = INSERT_RECORD_ID_STEP ? false : SELECTING_PROPERTIES

  return (
    <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
      <h1 className="text-muted-foreground text-lg">Nueva tarea - {messages[step]}</h1>
      {/* PROJECT step 0 */}
      {
        step < steps.length ? (
          <>
            {renderStep(step)}
          </>
        )
          : (
            <div>
              <div className="flex justify-between">
                <p><strong>Proyecto:</strong></p>
                <p>{projects.find(p => p.id === selectedProject)?.name}</p>
              </div>
              <div className="flex justify-between">
                <p><strong>Tipo de tarea:</strong></p>
                <p>{taskTypes.find(p => p.id === selectedTaskType)?.name}</p>
              </div>
              <div className="flex justify-between">
                <p><strong>Empresa:</strong></p>
                <p>{businesses.find(p => p.id === selectedBusiness)?.name}</p>
              </div>
              <div className="flex justify-between">
                <p><strong>Tipo expediente:</strong></p>
                <p>{recordTypes.find(p => p.id === selectedRecordType)?.name}</p>
              </div>
            </div>
          )
      }
      <div className="flex gap-4 justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setStep(step - 1)}
          disabled={ONE_ASSIGNED_PROJECT ? step === 1 : step === 0}
        >
          Atrás
        </Button>
        <Button
          size="sm"
          disabled={DISABLE_BUTTON}
          onMouseDown={() => {
            if (step === 2) {
              setStep(3)
            } else {
              return handleSubmitTask({
                userId: user.id,
                projectId: Number(selectedProject),
                taskTypeId: Number(selectedTaskType),
                businessId: Number(selectedBusiness),
                recordTypeId: Number(selectedRecordType),
                recordId,
              })
            }
          }}
        >
          Aceptar
        </Button>
      </div>
    </div>
  )
}

type Props = {
  handleSubmitTask: (createTaskFormData: CreateTaskFormData) => void
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
