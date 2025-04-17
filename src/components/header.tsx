"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "./theme-toggle"


export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between m-auto">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</Button>
        </div>
      </div>
    </header>
  )
}

