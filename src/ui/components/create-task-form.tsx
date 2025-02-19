import { Plus } from "lucide-react";
import { Button } from "./shared/button";
import React from "react";
import { Input } from "./shared/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./shared/select";

export function CreateTaskForm({ handleSubmitTask, projects, businesses, taskTypes }: Props) {

  const [selectedTaskType, setSelectedTaskType] = React.useState<TaskType>()

  return (
    <form onSubmit={handleSubmitTask} className="space-y-6">
      <Select name="project">
        <SelectTrigger>
          <SelectValue placeholder="Proyecto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={`${p.id}`}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="business">
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map(b => (
            <SelectItem key={b.id} value={`${b.id}`}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="task_type"
        onValueChange={(value) => setSelectedTaskType(taskTypes.find(t => t.id === Number(value)))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo de tarea" />
        </SelectTrigger>
        <SelectContent>
          {taskTypes.map(t => (
            <SelectItem key={t.id} value={`${t.id}`}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedTaskType && selectedTaskType?.steps.length > 0 ? (
        <Select name="step">
          <SelectTrigger>
            <SelectValue placeholder="Paso" />
          </SelectTrigger>
          <SelectContent>
            {selectedTaskType.steps.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Input
        type="text"
        name="record_id"
        placeholder="Expediente"
        required
      />
      <Button
        type="submit"
        name="intent"
        value="create-task"
        className="rounded-lg w-full flex items-center justify-center text-lg"
      >
        <Plus strokeWidth={2} />
        Iniciar Nueva Tarea
      </Button>
    </form>)
}

type Props = {
  projects: Project[]
  businesses: Business[]
  taskTypes: TaskType[]
  handleSubmitTask: (e: React.FormEvent<HTMLFormElement>) => void
}
