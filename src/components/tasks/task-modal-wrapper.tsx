"use client"

import { TaskDetailModal } from "@/components/tasks/task-detail-modal"
import { useRouter, useSearchParams } from "next/navigation"

interface TaskModalWrapperProps {
  task: {
    id: string
    title: string
    description: string | null
    status: string
    dueDate: Date | null
    projectId: string
    project: {
      title: string
    }
  }
}

export function TaskModalWrapper({ task }: TaskModalWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Create a new URL without the taskId parameter
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('taskId')
      router.push(`/projects/${task.projectId}?${newSearchParams.toString()}`)
    }
  }

  return (
    <TaskDetailModal 
      task={task} 
      open={true} 
      onOpenChange={handleOpenChange} 
    />
  )
} 