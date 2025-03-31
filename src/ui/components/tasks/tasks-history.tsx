import React from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { Input } from "../shared/input";
import { Button } from "../shared/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "../shared/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shared/select";
import { TasksTable } from "./task-table";

export function TasksHistory() {
  const [recordId, setRecorId] = React.useState<string>("");
  const debouncedRecordId = useDebounce(recordId, 500);

  const [count, setCount] = React.useState(0)
  const [pagination, setPagination] = React.useState({
    offset: 0,
    limit: 10,
  })

  const [tasks, setTasks] = React.useState<Task[]>([])

  React.useEffect(
    function validatePromoCode() {
      const offset = pagination.offset > 0 ? pagination.offset * pagination.limit : 0;
      return window.electron.getTaskHistory(offset, pagination.limit, debouncedRecordId)
    },
    [debouncedRecordId, pagination]
  );

  React.useEffect(function result() {
    return window.electron.getTaskHistoryResult((data) => {
      if (!data.success) {
        return
      }
      setCount(data.count)
      setTasks(data.rows)
    })
  }, [])

  console.log({ tasks })

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Input
        value={recordId}
        onChange={(e) => setRecorId(e.target.value)}
        placeholder="Buscar expediente"
      />
      <TasksTable
        tasks={tasks}
        description="Lista de tareas finalizadas"
        loading={false}
        handleResumeTask={null}
      />
      <Pagination
        pagination={pagination}
        setPagination={setPagination}
        count={count}
      />
    </div>
  )
}

function Pagination({ pagination, setPagination, count }: {
  pagination: { offset: number, limit: number },
  setPagination: React.Dispatch<React.SetStateAction<{ offset: number, limit: number }>>
  count: number
}) {
  return (
    <div className="flex justify-end items-center gap-4">
      <div className="flex w-full items-center justify-end gap-2">
        <Label className="text-nowrap">Filas por página</Label>
        <Select
          value={`${pagination.limit}`}
          onValueChange={(value) => setPagination(prev => ({ ...prev, limit: Number(value) }))}
        >
          <SelectTrigger className="max-w-20">
            <SelectValue placeholder="filas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="40">40</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        disabled={pagination.offset < 1}
        onMouseDown={() => setPagination(prev => ({ ...prev, offset: prev.offset - 1 }))}
      >
        <ArrowLeft color="red" />
      </Button>
      <div className="text-nowrap">
        Página {pagination.offset + 1}
      </div>
      <Button
        variant="ghost"
        disabled={pagination.offset + 2 * pagination.limit > count}
        onMouseDown={() => setPagination(prev => ({ ...prev, offset: prev.offset + 1 }))}
      >
        <ArrowRight color="blue" />
      </Button>
    </div>
  )
}
