"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PremiumModalProps {
  children: React.ReactNode
}

export function PremiumModal({ children }: PremiumModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Premium Access Required</DialogTitle>
          <DialogDescription>
            This feature is available to premium users only. Please participate in the presale to unlock this feature.
          </DialogDescription>
        </DialogHeader>
        {/* Add a link or button to the presale here later */}
        <div>
          Presale information will go here.
        </div>
      </DialogContent>
    </Dialog>
  )
}
