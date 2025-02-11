import { Plus } from "lucide-react";
import { Button } from "./shared/button";
import React from "react";
import { Input } from "./shared/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./shared/select";

export function CreateTaskForm({ handleSubmitTask }: Props) {

  const [formData, setFormData] = React.useState({
    proyecto: "",
    empresa: "",
    tipoDeTarea: "",
    expediente: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <form onSubmit={handleSubmitTask} className="space-y-6">
      <Select name="project">
        <SelectTrigger>
          <SelectValue placeholder="Proyecto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dev">Empresa</SelectItem>
        </SelectContent>
      </Select>
      <Select name="project">
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dev">Otizar C. A.</SelectItem>
          <SelectItem value="dev">COPCA</SelectItem>
        </SelectContent>
      </Select>
      <Select name="task_type">
        <SelectTrigger>
          <SelectValue placeholder="Tipo de tarea" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dev">Desarrollo</SelectItem>
          <SelectItem value="des">Diseño</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="text"
        name="expediente"
        placeholder="Expediente"
        value={formData.expediente}
        onChange={handleInputChange}
        required
      />
      <Button
        type="submit"
        className="rounded-full w-full flex items-center justify-center text-lg"
      >
        <Plus strokeWidth={2} />
        Iniciar Nueva Tarea
      </Button>
    </form>)
}

type Props = {
  handleSubmitTask: (e: React.FormEvent<HTMLFormElement>) => void
}
