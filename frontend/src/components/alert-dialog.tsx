import { OctagonAlert, Trash, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'src/components/ui/dialog';

export default function AlertDialog({
  triggerText,
  triggerIcon,
  triggerVariant,
  mainTitle,
  title,
  description,
  actionText,
  action,
}: {
  triggerText: string;
  triggerIcon: React.ReactNode;
  triggerVariant:
    | 'outline'
    | 'default'
    | 'destructive'
    | 'success'
    | 'link'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  mainTitle: string;
  title: string;
  description: string;
  actionText: string;
  action: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          {triggerText} {triggerIcon}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden font-sans">
        <div className="-mt-3 -mx-6 border-b pb-3 px-6 flex justify-between items-center">
          <DialogTitle>{mainTitle}</DialogTitle>
        </div>
        <DialogHeader className="pb-4">
          <DialogTitle>
            <div className=" mx-auto sm:mx-0 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <OctagonAlert className="h-5 w-5 text-destructive" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-[15px]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t -mx-6 -mb-6 px-6 py-5">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            <X /> Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              action();
              setIsDialogOpen(false);
            }}
          >
            <Trash />
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
