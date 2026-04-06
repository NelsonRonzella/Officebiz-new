"use client"

import { useState } from "react"
import { Search, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getYoutubeThumbnail, getYoutubeVideoId } from "@/lib/youtube"

interface Tutorial {
  id: string
  title: string
  description: string
  link: string
  createdAt: string
}

interface TrainingListProps {
  tutorials: Tutorial[]
}

export function TrainingList({ tutorials }: TrainingListProps) {
  const [search, setSearch] = useState("")

  const filtered = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {search
            ? "Nenhum treinamento encontrado para essa busca."
            : "Nenhum treinamento disponível no momento."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tutorial) => {
            const thumbnail = getYoutubeThumbnail(tutorial.link)
            const videoId = getYoutubeVideoId(tutorial.link)
            const embedUrl = videoId
              ? `https://www.youtube.com/watch?v=${videoId}`
              : tutorial.link

            return (
              <a
                key={tutorial.id}
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-video bg-muted">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={tutorial.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Play className="size-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-3">
                        <Play className="size-6 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {tutorial.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
