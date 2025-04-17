import { type TBoard, type TCardData, type TColumnData } from "@/components/board/data"
import { Board as BaseBoard } from "@/components/board"
import { useCallback, useEffect, useState } from "react"

interface BoardWrapperProps {
  initial: TBoard
  onDrop?: (source: { data: TCardData }, destination: { data: TColumnData }, position: number) => void
}

export function BoardWrapper({ initial, onDrop }: BoardWrapperProps) {
  const [boardData, setBoardData] = useState<TBoard>(initial)

  useEffect(() => {
    setBoardData(initial)
  }, [initial])

  const handleDrop = useCallback(
    (source: { data: TCardData }, destination: { data: TColumnData }, position: number) => {
      console.log('handleDrop', source, destination, position)
      if (!destination || !onDrop) {
        return
      }

      onDrop(source, destination, position)
    },
    [onDrop]
  )

  return (
    <div className="w-full overflow-x-auto">
      <BaseBoard
        initial={boardData}
        onDrop={handleDrop}
      />
    </div>
  )
} 