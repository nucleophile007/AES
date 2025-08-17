import type React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Added PointElement for line chart points
  LineElement, // Added LineElement for line chart lines
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { Line, Bar } from "react-chartjs-2"

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // Registered PointElement
  LineElement, // Registered LineElement
  BarElement,
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

  const getColorByValue = (value: number) => {
    const colorMap: { [key: number]: string } = {
      7: "#94e3cb", // Red for value 7
      8: "#4ECDC4", // Teal for value 8
      9: "#45B7D1", // Blue for value 9
      10: "#96CEB4", // Green for value 10
    }
    return colorMap[value] || "#7EC8E3" // Default color if value not found
  }

  const impactData = {
    labels: ["AMC 10 Top 5%", "F=ma Top 5%", "Chem/Bio Olympiad Medal"],
    datasets: [
      {
        label: "Current Impact",
        data: [7, 8, 10],
        backgroundColor: [7, 8, 10].map((value) => getColorByValue(value)),
        borderRadius: 8,
      },
      {
        label: "Potential Impact",
        data: [8, 9, 8],
        backgroundColor: [8, 9, 8].map((value) => getColorByValue(value)),
        borderRadius: 8,
      },
    ],
  }

  const impactOptions = {
    indexAxis: "y" as const,
    responsive: true,
    animation: {
      duration: 2500,
      easing: "easeOutBounce" as const,
      delay: (context: any) => context.datasetIndex * 300 + context.dataIndex * 150,
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#fff",
        anchor: "center" as const,
        align: "center" as const,
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => value,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "#fff",
          stepSize: 2,
          callback: function(this: any, tickValue: string | number) {
            const value = Number(tickValue);
            const labels: { [key: number]: string } = {
              0: "None",
              2: "Low",
              4: "Good",
              6: "Very Strong",
              8: "High",
              10: "Game-Changer",
            }
            return labels[value] ?? value
          },
        },
        grid: { color: "rgba(255,255,255,0.2)" },
        title: {
          display: true,
          text: "Impact Level",
          color: "#fff",
          font: { size: 12 },
        },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { display: false },
        title: {
          display: true,
          text: "Competitive Extracurricularity",
          color: "#fff",
          font: { size: 12 },
        },
      },
    },
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Line Chart */}
      <div className="bg-gradient-to-br from-[#12264d]/90 to-[#12264d]/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 shadow-2xl flex flex-col">
        <div className="flex-1">
          <h3 className="text-2xl font-bold theme-text-light mb-4">
            Projected Effort Level Over Time
          </h3>
          <p className="text-sm theme-text-muted mb-6 leading-relaxed">
            College preparation demands increasing dedication as deadlines approach. This chart illustrates the general
            intensity of effort required at each stage.
          </p>
        </div>
        <div className="bg-[#0e1c3b] rounded-xl p-4 border border-yellow-400/10">
          <Line data={effortData} options={effortOptions} />
        </div>
      </div>

      {/* Right: Bar Chart */}
      <div className="bg-gradient-to-br from-[#12264d]/90 to-[#12264d]/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 shadow-2xl flex flex-col">
        <div className="flex-1">
          <h3 className="text-2xl font-bold theme-text-light mb-4">
            Key Competitive Achievements: Impact on Applications
          </h3>
          <p className="text-sm theme-text-muted mb-6 leading-relaxed">
            This chart illustrates the <span className="font-semibold text-yellow-400">significant impact</span> specific achievements can have, distinguishing your
            application to top universities. Higher scores represent greater impact.
          </p>
        </div>
        <div className="bg-[#0e1c3b] rounded-xl p-4 border border-yellow-400/10">
          <Bar data={impactData} options={impactOptions} />
        </div>
      </div>
    </div>
  )
}

export default InfographicDashboard
