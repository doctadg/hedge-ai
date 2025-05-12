"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConnectButton } from "@/components/ConnectButton"

interface LoginModalProps {
  children: React.ReactNode
}

export function LoginModal({ children, isOpen }: LoginModalProps & { isOpen: boolean }) {
  // If the Dialog is controlled by the 'open' prop, DialogTrigger might not be necessary
  // or should be used differently. Assuming 'children' is the content of the modal.
  return (
    <Dialog open={isOpen}>
      {/* <DialogTrigger asChild>{children}</DialogTrigger>  Removed: If open is controlled, trigger is implicit or not needed here. */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>
            You need to connect your wallet to access the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4"> {/* Added a wrapper for consistent spacing if needed */}
          {children} {/* Children are rendered as the main content of the modal */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
