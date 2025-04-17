"use client"

import { type Task, TaskStatus } from "@/lib/db/schema"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"
import { type TCardData, type TColumnData } from "@/components/board/data"
import { BoardWrapper } from "./board-wrapper"
import { useRouter, useSearchParams } from "next/navigation"

interface TaskBoardProps {
  tasks: Task[]
  projectId: string
}

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDrop = useCallback(
    async (source: { data: TCardData }, destination: { data: TColumnData }, position: number) => {
      if (!destination) {
        return
      }

      const taskId = source.data.card.id
      const newStatus = destination.data.column.id as TaskStatus

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            status: newStatus,
            position: position === -1 ? "bottom" : "top", // Convert position to a string for the API
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update task status")
        }

        toast.success("Task status updated")
      } catch {
        toast.error("Failed to update task status")
      }
    },
    []
  )

  const initial = useMemo(() => {
    const columns = [
      {
        id: TaskStatus.TODO,
        title: "To Do",
        cards: tasks
          .filter((task) => task.status === TaskStatus.TODO)
          .map((task) => ({
            id: task.id,
            description: task.description || "",
            data: {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              dueDate: task.dueDate,
            },
            onClick: () => {
              const newSearchParams = new URLSearchParams(searchParams.toString())
              newSearchParams.set('taskId', task.id)
              router.push(`/projects/${projectId}?${newSearchParams.toString()}`)
            },
          })),
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: "In Progress",
        cards: tasks
          .filter((task) => task.status === TaskStatus.IN_PROGRESS)
          .map((task) => ({
            id: task.id,
            description: task.description || "",
            data: {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              dueDate: task.dueDate,
            },
            onClick: () => {
              const newSearchParams = new URLSearchParams(searchParams.toString())
              newSearchParams.set('taskId', task.id)
              router.push(`/projects/${projectId}?${newSearchParams.toString()}`)
            },
          })),
      },
      {
        id: TaskStatus.DONE,
        title: "Done",
        cards: tasks
          .filter((task) => task.status === TaskStatus.DONE)
          .map((task) => ({
            id: task.id,
            description: task.description || "",
            data: {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              dueDate: task.dueDate,
            },
            onClick: () => {
              const newSearchParams = new URLSearchParams(searchParams.toString())
              newSearchParams.set('taskId', task.id)
              router.push(`/projects/${projectId}?${newSearchParams.toString()}`)
            },
          })),
      },
    ]

    return { columns }
  }, [tasks, projectId, router, searchParams])

  return <BoardWrapper initial={initial} onDrop={handleDrop} />
} 