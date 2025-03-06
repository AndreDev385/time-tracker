export function isTask(t: Task | OtherTask): t is Task {
  if ((t as Task).taskTypeId) {
    return true
  }
  return false
}

