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
  triggerClass,
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
  triggerClass?: string;
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
        <Button variant={triggerVariant} className={triggerClass}>
          {triggerText} {triggerIcon}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden font-sans">
        <div className="-mt-3 -mx-6 border-b pb-3 px-6 flex justify-between items-center">
          <DialogTitle className="flex items-center gap-2">
            <OctagonAlert className="h-5 w-5 text-destructive" />
            {mainTitle}
          </DialogTitle>
        </div>
        <DialogHeader className="pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[15px]">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t -mx-6 -mb-6 px-6 py-5">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            <X /> Annuler
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              action();
              setIsDialogOpen(false);
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash />
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
