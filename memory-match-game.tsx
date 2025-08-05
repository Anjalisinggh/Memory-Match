"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer, RotateCcw, Trophy, Zap } from "lucide-react"

const emojis = [
  "bee", "bug", "cat", "duck", "elephant", "fox",
  "giraffe", "hippo", "koala", "monkey", "pen",
  "rabbit", "turtle", "sheep"
]

type GameCard = {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

type Difficulty = {
  name: string
  pairs: number
  gridCols: string
}

const difficulties: Record<string, Difficulty> = {
  easy: { name: "Easy", pairs: 6, gridCols: "grid-cols-3" },
  medium: { name: "Medium", pairs: 8, gridCols: "grid-cols-4" },
  hard: { name: "Hard", pairs: 12, gridCols: "grid-cols-4" },
}

export default function MemoryMatchGame() {
  const [difficulty, setDifficulty] = useState<string>("easy")
  const [cards, setCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const initializeGame = useCallback(() => {
    const { pairs } = difficulties[difficulty]
    const selectedEmojis = emojis.slice(0, pairs)
    const gameCards: GameCard[] = []
    selectedEmojis.forEach((emoji, index) => {
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      )
    })
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTime(0)
    setIsGameActive(false)
    setGameWon(false)
    setIsChecking(false)
  }, [difficulty])

  useEffect(() => { initializeGame() }, [initializeGame])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && !gameWon) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameWon])

  useEffect(() => {
    const totalPairs = difficulties[difficulty].pairs
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      setGameWon(true)
      setIsGameActive(false)
    }
  }, [matchedPairs, difficulty])

  // Auto-reshuffle after each round win (after 1.25s)
  useEffect(() => {
    if (gameWon) {
      const timeout = setTimeout(() => {
        initializeGame()
      }, 1250)
      return () => clearTimeout(timeout)
    }
  }, [gameWon, initializeGame])

  const handleCardClick = (cardId: number) => {
    if (!isGameActive) setIsGameActive(true)
    if (isChecking || flippedCards.length >= 2) return
    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)
      setIsChecking(true)
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find((c) => c.id === firstId)
      const secondCard = cards.find((c) => c.id === secondId)
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)))
          setMatchedPairs((prev) => prev + 1)
          setFlippedCards([])
          setIsChecking(false)
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)))
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStarRating = () => {
    const totalPairs = difficulties[difficulty].pairs
    const efficiency = totalPairs / moves
    if (efficiency >= 0.8) return 3
    if (efficiency >= 0.6) return 2
    return 1
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/img/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white/80 dark:bg-black/60 rounded-2xl shadow-lg p-4">
        <Card className="mb-6 bg-transparent border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Memory Match 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-lg">{formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="font-mono text-lg">{moves} moves</span>
                </div>
                <Badge variant="secondary">
                  {matchedPairs}/{difficulties[difficulty].pairs} pairs
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficulties).map(([key, diff]) => (
                      <SelectItem key={key} value={key}>
                        {diff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={initializeGame} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {gameWon && (
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-green-700">Congratulations!</h3>
                </div>
                <p className="text-green-600 mb-2">
                  You completed the game in {formatTime(time)} with {moves} moves!
                </p>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span key={i} className={`text-2xl ${i < getStarRating() ? "text-yellow-400" : "text-gray-300"}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`grid ${difficulties[difficulty].gridCols} gap-2 max-w-2xl mx-auto`}
              style={{
                width: "100%",
                maxHeight: "85vh",
                gridAutoRows: "1fr",
                placeItems: "center",
                alignContent: "center"
              }}
            >
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched || isChecking}
                  className={`
                    rounded-lg transition-all duration-200 transform hover:scale-105
                    w-[11vw] h-[11vw] max-w-[96px] max-h-[96px] min-w-0 min-h-0 sm:w-[8vw] sm:h-[8vw]
                    border-none bg-none
                    ${card.isMatched ? "ring-2 ring-green-400 ring-opacity-50" : ""}
                    disabled:cursor-not-allowed
                  `}
                  aria-label={card.isFlipped || card.isMatched ? `Card showing ${card.emoji}` : "Hidden card"}
                  style={{
                    boxShadow: card.isFlipped || card.isMatched ? "0 4px 20px 0 rgba(52, 89, 202, 0.17)" : "none",
                    background: card.isFlipped || card.isMatched
                      ? "#fff"
                      : "linear-gradient(135deg, #8f5ede 0%, #50a5fa 100%)",
                    border: card.isFlipped || card.isMatched ? "1.5px solid #95b7ed" : "none"
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {card.isFlipped || card.isMatched ? (
                      <img
                        src={`/img/${card.emoji}.jpg`}
                        alt={card.emoji}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        draggable={false}
                      />
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
