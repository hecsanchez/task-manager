import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskList } from "@/components/tasks/task-list"
import { TaskBoard } from "@/components/tasks/task-board"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TaskModalWrapper } from "@/components/tasks/task-modal-wrapper"

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    taskId?: string
  }>
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params
  const { taskId } = await searchParams
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // If taskId is provided in the URL, verify it exists and belongs to this project
  let task = null
  if (taskId) {
    task = await prisma.task.findUnique({
      where: {
        id: taskId,
        projectId: id,
      },
      include: {
        project: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!task) {
      notFound()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-start gap-2">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <p className="text-muted-foreground">{project.description || "No description provided"}</p>
            </div>
          </div>
          
        </div>
        <div className="flex items-center gap-4">
          <CreateTaskDialog projectId={project.id} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        </div>
        <Tabs defaultValue="board" className="w-full">
          <TabsList>
            <TabsTrigger value="board">Board View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="mt-6">
            <TaskBoard tasks={project.tasks} projectId={project.id} />
          </TabsContent>
          <TabsContent value="list" className="mt-6">
            {project.tasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <TaskList tasks={project.tasks} projectId={project.id} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {task && (
        <TaskModalWrapper 
          task={{
            ...task,
            project: {
              title: task.project.title
            }
          }} 
        />
      )}
    </div>
  )
} 