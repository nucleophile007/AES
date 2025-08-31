import type React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Added PointElement for line chart points
  LineElement, // Added LineElement for line chart lines
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { Line } from "react-chartjs-2"

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // Registered PointElement
  LineElement, // Registered LineElement
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const InfographicDashboard: React.FC = () => {
  // Line Chart Data (unchanged)
  const effortData = {
    labels: ["Grade 9-10", "Grade 11 Fall", "Grade 11 Spring", "Grade 12 Fall", "Grade 12 Spring"],
    datasets: [
      {
        label: "Effort Level",
        data: [3, 5, 7, 8.5, 6],
        borderColor: "#9ED3F9",
        backgroundColor: "rgba(158, 211, 249, 0.3)", // Added semi-transparent fill color for area shading
        pointRadius: 5,
        tension: 0.4,
        fill: true, // Enable area fill under the line
      },
    ],
  }

  const effortOptions = {
    responsive: true,
    animation: {
      duration: 2000,
      easing: "easeInOutQuart" as const,
      delay: (context: any) => context.dataIndex * 200,
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
          color: "#fff",
          callback: function(this: any, tickValue: string | number) {
            return `${tickValue}`;
          },
        },
        grid: { color: "rgba(255,255,255,0.2)" },
        title: {
          display: true,
          text: "Effort Level",
          color: "#fff",
          font: { size: 12 },
        },
      },
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
        title: {
          display: true,
          text: "Timeline Stage",
          color: "#fff",
          font: { size: 12 },
        },
      },
    },
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Single Chart */}
        <div className="bg-gradient-to-br from-[#12264d]/90 to-[#12264d]/80 backdrop-blur-xl rounded-3xl p-12 border border-yellow-400/20 shadow-2xl flex flex-col min-h-[600px]">
          <div className="flex-1">
            <h3 className="text-3xl font-bold theme-text-light mb-6">
              Projected Effort Level Over Time
            </h3>
            <p className="text-base theme-text-muted mb-8 leading-relaxed">
              College preparation demands increasing dedication as deadlines approach. This chart illustrates the general
              intensity of effort required at each stage.
            </p>
          </div>
          <div className="bg-[#0e1c3b] rounded-xl p-6 border border-yellow-400/10 flex-1 flex items-center justify-center">
            <div className="w-full h-full">
              <Line data={effortData} options={effortOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfographicDashboard
