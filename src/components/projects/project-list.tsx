"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { type Project } from "@/lib/db/schema"

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {project.description || "No description provided"}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 