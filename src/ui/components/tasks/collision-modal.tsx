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
          <DialogTitle>Este expediente ya existe</DialogTitle>
          <DialogDescription>
            Si continuas el tiempo dedicado a este expediente por el usuario anterior sera marcado como no productivo.
            Estas seguro que quieres continuar?
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
  state: { open: boolean }
  setState: React.Dispatch<React.SetStateAction<{ open: boolean }>>
  submit: () => void
}
