import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface ConfirmationDialogProps {
    isDialogOpen: boolean
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    id:string
    action: (id:string)=>Promise<void>

}
export default function ConfirmationDialog({isDialogOpen,setIsDialogOpen,id,action}:ConfirmationDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
      <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
          This action cannot be undone. Are you sure you want to permanently
          delete this Topic from our servers?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
           <DialogClose asChild>
            <Button type="button" variant='ghost'>
              Cancel
            </Button>
          </DialogClose>
          <Button  variant='destructive' onClick={()=>action(id)}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
