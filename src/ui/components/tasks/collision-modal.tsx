import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/shared/dialog"
import { Button } from "../shared/button"

export function CollisionModal({
  state,
  setState,
  submit,
}: Props) {
  return (
    <Dialog open={state.open} onOpenChange={(open: boolean) => setState({ open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expediente ya realizado!</DialogTitle>
          <DialogDescription>
            El usuario <strong>{state.user}</strong> ya ha creado este expediente con la tarea <strong>"{state.taskType}"</strong>! Si continuas se le cambiara el tiempo dedicado de <strong>"PRODUCTIVO"</strong> a <strong>"NO PRODUCTIVO"</strong> ¿Estás seguro que deseas continuar?
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
  state: { open: boolean, user: string, taskType: string }
  setState: (value: { open: boolean }) => void
  submit: () => void
}
