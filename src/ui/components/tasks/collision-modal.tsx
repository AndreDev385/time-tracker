import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/shared/dialog"
import { Button } from "../shared/button"

export function CollisionModal({
  state,
  setState,
  submit,
}: Props) {

  const standarMessage = <p>El usuario <strong>{state.user}</strong> ya ha creado este expediente con la tarea <strong>"{state.taskType}"</strong>! Si continuas se le cambiara el tiempo dedicado de <strong>"PRODUCTIVO"</strong> a <strong>"NO PRODUCTIVO"</strong> ¿Estás seguro que deseas continuar?</p>

  const cancelledTaskMessage = <p>Esta tarea ha sido vista por el usuario {state.user}</p>

  return (
    <Dialog open={state.open} onOpenChange={(open: boolean) => setState({ open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expediente ya realizado!</DialogTitle>
          <DialogDescription>
            {state.taskStatus === "canceled" ? cancelledTaskMessage : standarMessage}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onMouseDown={() => setState({ open: false })}
            variant="destructive"
          >
            Cancelar
          </Button>
          <Button
            onMouseDown={() => {
              setState({ open: false })
              submit()
            }}
            variant="default"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type Props = {
  state: { open: boolean, user: string, taskType: string, taskStatus: Task['status'] }
  setState: (value: { open: boolean }) => void
  submit: () => void
}
