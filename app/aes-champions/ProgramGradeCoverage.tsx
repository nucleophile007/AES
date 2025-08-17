import type React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import ChartDataLabels from "chartjs-plugin-datalabels"

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

const ProgramGradeCoverage: React.FC = () => {
  // Brand colors per level to match cards: Blue, Green, Yellow, Purple, Red
  const fillColors = [
    "rgba(59, 130, 246, 0.7)",  // Level 1 - blue-500
    "rgba(16, 185, 129, 0.7)",  // Level 2 - green-500
    "rgba(245, 158, 11, 0.8)",  // Level 3 - yellow-500 (brighter, needs dark text)
    "rgba(139, 92, 246, 0.7)",  // Level 4 - purple-500
    "rgba(239, 68, 68, 0.7)",   // Level 5 - red-500
  ]
  const strokeColors = [
    "rgba(59, 130, 246, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(245, 158, 11, 1)",
    "rgba(139, 92, 246, 1)",
    "rgba(239, 68, 68, 1)",
  ]

  // Chart data: each bar is a [startGrade, endGrade] range
  const data = {
    labels: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
    datasets: [
      {
        label: "Grade Range",
        data: [
          [5, 8],  // Level 1 covers Grades 5–8
          [6, 9],  // Level 2
          [7, 10], // Level 3
          [8, 11], // Level 4
          [9, 12], // Level 5
        ],
        backgroundColor: fillColors,
        borderColor: strokeColors,
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  }

  const options = {
    indexAxis: "y" as const, // horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 40,
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: (ctx: any) => (ctx.dataIndex === 2 ? "#1a2236" : "#ffffff"), // dark text on yellow bar
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: (value: number[]) => `Grades ${value[0]}–${value[1]}`,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const [s, e] = ctx.raw as number[]
            return ` ${ctx.label}: Grades ${s}–${e}`
          },
        },
      },
    },
    scales: {
      x: {
        min: 4,
        max: 13,
        title: {
          display: true,
          text: "Grade Level",
          color: "#ffffff",
          font: { size: 13, weight: "bold" as const },
        },
        ticks: {
          color: "rgba(255,255,255,0.85)",
          stepSize: 1,
          callback: (value: any) => `${value}`,
        },
        grid: { color: "rgba(255,255,255,0.08)" },
        border: { color: "rgba(255,255,255,0.15)" },
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.9)" },
        grid: { color: "rgba(255,255,255,0.08)" },
        border: { color: "rgba(255,255,255,0.15)" },
      },
    },
  }

  return (
    <div className="bg-gradient-to-br from-[#1a2236] to-[#2a3246] rounded-3xl p-8 border border-yellow-400/20">
      <h3 className="text-2xl font-bold text-center theme-text-light">Program Grade Coverage</h3>
      <p className="text-sm theme-text-muted text-center max-w-3xl mx-auto mt-3">
        Each level is tailored to specific grade ranges, ensuring age-appropriate challenges and peer groups.
      </p>
      <div className="mt-8 h-[420px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

export default ProgramGradeCoverage
