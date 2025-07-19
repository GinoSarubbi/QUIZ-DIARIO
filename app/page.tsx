"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Brain, Flame, Users, Star, Crown } from "lucide-react"

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
}

interface UserStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  gamesPlayed: number
  lastPlayedDate: string
  competitiveUnlocked: boolean
}

interface LeaderboardEntry {
  name: string
  score: number
  time: number
  date: string
}

const dailyQuestions: Question[] = [
  {
    id: 1,
    question: "¿Cuál es el planeta más grande del sistema solar?",
    options: ["Tierra", "Júpiter", "Saturno", "Neptuno"],
    correct: 1,
  },
  {
    id: 2,
    question: "¿En qué año llegó el hombre a la Luna?",
    options: ["1967", "1968", "1969", "1970"],
    correct: 2,
  },
  {
    id: 3,
    question: "¿Cuál es la capital de Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct: 2,
  },
  {
    id: 4,
    question: "¿Quién escribió 'Cien años de soledad'?",
    options: ["Mario Vargas Llosa", "Gabriel García Márquez", "Jorge Luis Borges", "Octavio Paz"],
    correct: 1,
  },
  {
    id: 5,
    question: "¿Cuál es el elemento químico más abundante en el universo?",
    options: ["Oxígeno", "Carbono", "Hidrógeno", "Helio"],
    correct: 2,
  },
]

const competitiveQuestions: Question[] = [
  {
    id: 1,
    question: "¿Cuál es la velocidad de la luz en el vacío?",
    options: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "298,792,458 m/s"],
    correct: 0,
  },
  {
    id: 2,
    question: "¿Quién pintó 'La noche estrellada'?",
    options: ["Pablo Picasso", "Claude Monet", "Vincent van Gogh", "Leonardo da Vinci"],
    correct: 2,
  },
  {
    id: 3,
    question: "¿Cuál es la fórmula química del agua?",
    options: ["H2O", "CO2", "NaCl", "CH4"],
    correct: 0,
  },
  {
    id: 4,
    question: "¿En qué año cayó el Muro de Berlín?",
    options: ["1987", "1988", "1989", "1990"],
    correct: 2,
  },
  {
    id: 5,
    question: "¿Cuál es el océano más grande del mundo?",
    options: ["Atlántico", "Índico", "Ártico", "Pacífico"],
    correct: 3,
  },
  {
    id: 6,
    question: "¿Quién desarrolló la teoría de la relatividad?",
    options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
    correct: 1,
  },
  {
    id: 7,
    question: "¿Cuál es la montaña más alta del mundo?",
    options: ["K2", "Everest", "Makalu", "Cho Oyu"],
    correct: 1,
  },
  {
    id: 8,
    question: "¿En qué continente se encuentra Egipto?",
    options: ["Asia", "Europa", "África", "América"],
    correct: 2,
  },
  {
    id: 9,
    question: "¿Cuál es el metal más abundante en la corteza terrestre?",
    options: ["Hierro", "Aluminio", "Cobre", "Oro"],
    correct: 1,
  },
  {
    id: 10,
    question: "¿Quién escribió 'Don Quijote de la Mancha'?",
    options: ["Lope de Vega", "Miguel de Cervantes", "Francisco de Quevedo", "Calderón de la Barca"],
    correct: 1,
  },
]

// Leaderboard simulado
const mockLeaderboard: LeaderboardEntry[] = [
  { name: "Ana García", score: 10, time: 45, date: "2024-01-19" },
  { name: "Carlos López", score: 9, time: 52, date: "2024-01-19" },
  { name: "María Rodríguez", score: 9, time: 58, date: "2024-01-19" },
  { name: "Juan Pérez", score: 8, time: 41, date: "2024-01-19" },
  { name: "Laura Martín", score: 8, time: 47, date: "2024-01-19" },
  { name: "Diego Silva", score: 7, time: 39, date: "2024-01-19" },
  { name: "Sofia Chen", score: 7, time: 44, date: "2024-01-19" },
  { name: "Roberto Kim", score: 6, time: 51, date: "2024-01-19" },
]

export default function DailyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    gamesPlayed: 0,
    lastPlayedDate: "",
    competitiveUnlocked: false,
  })
  const [gameMode, setGameMode] = useState<"daily" | "competitive">("daily")
  const [competitiveStartTime, setCompetitiveStartTime] = useState<number>(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard)
  const [activeTab, setActiveTab] = useState("quiz")

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = () => {
    const savedStats = localStorage.getItem("userStats")
    if (savedStats) {
      const stats = JSON.parse(savedStats)
      setUserStats(stats)

      // Verificar si ya jugó hoy
      const today = new Date().toDateString()
      if (stats.lastPlayedDate === today) {
        setHasPlayedToday(true)
        const todayScore = localStorage.getItem("todayScore")
        if (todayScore) {
          setScore(Number.parseInt(todayScore))
          setQuizCompleted(true)
        }
      }
    }
  }

  const updateUserStats = (newScore: number, isCompetitive = false) => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    let newStreak = userStats.currentStreak

    // Calcular racha
    if (userStats.lastPlayedDate === yesterday) {
      newStreak = userStats.currentStreak + 1
    } else if (userStats.lastPlayedDate !== today) {
      newStreak = 1
    }

    const pointsEarned = isCompetitive ? newScore * 2 : newScore * 10 + newStreak * 5

    const newStats: UserStats = {
      totalPoints: userStats.totalPoints + pointsEarned,
      currentStreak: newStreak,
      longestStreak: Math.max(userStats.longestStreak, newStreak),
      gamesPlayed: userStats.gamesPlayed + 1,
      lastPlayedDate: today,
      competitiveUnlocked: newStreak >= 3 || userStats.competitiveUnlocked,
    }

    setUserStats(newStats)
    localStorage.setItem("userStats", JSON.stringify(newStats))

    if (!isCompetitive) {
      localStorage.setItem("todayScore", newScore.toString())
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const questions = gameMode === "daily" ? dailyQuestions : competitiveQuestions
    let newScore = score
    if (selectedAnswer === questions[currentQuestion].correct) {
      newScore = score + 1
      setScore(newScore)
    }

    setShowResult(true)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        // Quiz completado
        setQuizCompleted(true)
        updateUserStats(newScore, gameMode === "competitive")

        if (gameMode === "daily") {
          setHasPlayedToday(true)
        } else {
          // Agregar al leaderboard competitivo
          const timeElapsed = Math.floor((Date.now() - competitiveStartTime) / 1000)
          const newEntry: LeaderboardEntry = {
            name: "Tú",
            score: newScore,
            time: timeElapsed,
            date: new Date().toDateString(),
          }
          const updatedLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score || a.time - b.time)
            .slice(0, 10)
          setLeaderboard(updatedLeaderboard)
          localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard))
        }
      }
    }, 1500)
  }

  const startCompetitiveMode = () => {
    setGameMode("competitive")
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizCompleted(false)
    setCompetitiveStartTime(Date.now())
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizCompleted(false)
    setHasPlayedToday(false)
    setGameMode("daily")
    localStorage.removeItem("todayScore")
  }

  const getScoreMessage = () => {
    const questions = gameMode === "daily" ? dailyQuestions : competitiveQuestions
    const percentage = (score / questions.length) * 100
    if (percentage === 100) return "¡Perfecto! 🎉"
    if (percentage >= 80) return "¡Excelente! 🌟"
    if (percentage >= 60) return "¡Bien hecho! 👏"
    if (percentage >= 40) return "No está mal 👍"
    return "Sigue intentando 💪"
  }

  const getStreakBonus = () => {
    if (userStats.currentStreak >= 7) return "🔥 ¡Racha de fuego!"
    if (userStats.currentStreak >= 5) return "⚡ ¡Súper racha!"
    if (userStats.currentStreak >= 3) return "🌟 ¡Gran racha!"
    return ""
  }

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Pantalla de estadísticas
  const StatsPanel = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Tus Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
            <div className="text-sm text-gray-600">Puntos Totales</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5" />
              {userStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Racha Actual</div>
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">{userStats.longestStreak}</div>
          <div className="text-sm text-gray-600">Mejor Racha</div>
        </div>

        {userStats.currentStreak >= 3 && (
          <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <Crown className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="font-bold text-green-800">¡Modo Competitivo Desbloqueado!</div>
            <div className="text-sm text-green-600">Compite contra otros jugadores</div>
          </div>
        )}

        {getStreakBonus() && (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {getStreakBonus()}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Leaderboard
  const LeaderboardPanel = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Users className="h-6 w-6 text-purple-500" />
          Clasificación Competitiva
        </CardTitle>
        <CardDescription>Los mejores jugadores de hoy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.name === "Tú" ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-sm text-gray-500">{entry.time}s</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{entry.score}/10</div>
                <div className="text-sm text-gray-500">puntos</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (hasPlayedToday && quizCompleted && gameMode === "daily") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Diario</h1>
            <p className="text-gray-600 capitalize">{today}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="mt-6">
              <Card className="text-center">
                <CardHeader>
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <CardTitle className="text-2xl">¡Ya completaste el quiz de hoy!</CardTitle>
                  <CardDescription>
                    Tu puntuación: {score} de {dailyQuestions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-6">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {getScoreMessage()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">+{score * 10 + userStats.currentStreak * 5}</div>
                      <div className="text-sm text-gray-600">Puntos ganados</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                        <Flame className="h-4 w-4" />
                        {userStats.currentStreak}
                      </div>
                      <div className="text-sm text-gray-600">Racha actual</div>
                    </div>
                  </div>

                  {userStats.competitiveUnlocked && (
                    <div className="mb-4">
                      <Button onClick={startCompetitiveMode} className="w-full mb-2">
                        <Crown className="h-4 w-4 mr-2" />
                        Jugar Modo Competitivo
                      </Button>
                      <p className="text-sm text-gray-600">¡Compite contra otros jugadores!</p>
                    </div>
                  )}

                  <p className="text-gray-600 mb-6">Vuelve mañana para un nuevo desafío</p>
                  <Button onClick={resetQuiz} variant="outline">
                    Reiniciar Quiz (Solo para pruebas)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <StatsPanel />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <LeaderboardPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const questions = gameMode === "daily" ? dailyQuestions : competitiveQuestions
    const timeElapsed = gameMode === "competitive" ? Math.floor((Date.now() - competitiveStartTime) / 1000) : 0

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {gameMode === "daily" ? "Quiz Diario" : "Modo Competitivo"}
            </h1>
            <p className="text-gray-600 capitalize">{today}</p>
          </div>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <CardTitle className="text-2xl">
                {gameMode === "daily" ? "¡Quiz Completado!" : "¡Desafío Completado!"}
              </CardTitle>
              <CardDescription>
                Puntuación final: {score} de {questions.length}
                {gameMode === "competitive" && <div className="mt-2">Tiempo: {timeElapsed} segundos</div>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={(score / questions.length) * 100} className="mb-4" />
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {getScoreMessage()}
                </Badge>
              </div>

              {gameMode === "daily" && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">+{score * 10 + userStats.currentStreak * 5}</div>
                    <div className="text-sm text-gray-600">Puntos ganados</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4" />
                      {userStats.currentStreak + 1}
                    </div>
                    <div className="text-sm text-gray-600">Nueva racha</div>
                  </div>
                </div>
              )}

              {gameMode === "competitive" && (
                <div className="mb-6">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-bold text-purple-800">¡Puntuación registrada!</div>
                    <div className="text-sm text-purple-600">Revisa tu posición en el ranking</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {gameMode === "daily" ? (
                  <p className="text-gray-600">¡Vuelve mañana para un nuevo desafío!</p>
                ) : (
                  <Button onClick={() => setActiveTab("leaderboard")} className="w-full">
                    Ver Clasificación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const questions = gameMode === "daily" ? dailyQuestions : competitiveQuestions
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {gameMode === "daily" ? "Quiz Diario" : "Modo Competitivo"}
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <p className="capitalize">{today}</p>
          </div>
          {gameMode === "competitive" && (
            <Badge variant="outline" className="mt-2">
              <Crown className="h-3 w-3 mr-1" />
              Modo Competitivo Activo
            </Badge>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm text-gray-600">Puntuación: {score}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? showResult
                        ? index === question.correct
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-red-500 bg-red-50 text-red-800"
                        : "border-blue-500 bg-blue-50"
                      : showResult && index === question.correct
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>

            {showResult && (
              <div className="text-center mb-4">
                {selectedAnswer === question.correct ? (
                  <Badge className="bg-green-500 text-white">¡Correcto! 🎉</Badge>
                ) : (
                  <Badge variant="destructive">Incorrecto 😔</Badge>
                )}
              </div>
            )}

            <div className="text-center">
              <Button onClick={handleNextQuestion} disabled={selectedAnswer === null || showResult} className="px-8">
                {currentQuestion === questions.length - 1 ? "Finalizar Quiz" : "Siguiente Pregunta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
