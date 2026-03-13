import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts"
import "./DailyHours.css"
const API = "/analytics/daily"

function DailyHours() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [years, setYears] = useState([])

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(res => {
          setData(res)
          const uniqueYears = [
            ...new Set(res.map(d => new Date(d.date).getFullYear()))
          ].sort((a,b)=>b-a)
          setYears(uniqueYears)
        })
  }, [])

  useEffect(() => {
    const filtered = data.filter(d => {
      const date = new Date(d.date)
      return (
        date.getMonth() + 1 === Number(month) &&
        date.getFullYear() === Number(year)
      )
    })
    setFilteredData(filtered)
  }, [data, month, year])


  const getColor = (hours) => {
    if (hours >= 8) return "#f59e0b"
    if (hours >= 5) return "#3b82f6"
    return "#475569"
  }

  const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ]

  return (
    <div className="daily-card">
      {/* HEADER */}
      <div className="daily-header">
        <div className="daily-title">
          Daily Hours
        </div>

        <div className="daily-filters">
            <select className="daily-select" value={month} onChange={(e)=>setMonth(e.target.value)}> 
              {months.map((m,i)=>(
                  <option key={i+1} value={i+1}>
                    {m}
                  </option>
                ))}
            </select>

            <select className="daily-select" value={year} onChange={(e)=>setYear(e.target.value)} >
              {years.map(y=>(
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
        </div>
      </div>


      {/* CHART */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date)=>date.slice(8)}
              minTickGap={25}
            />

            <YAxis />

            <Tooltip
              labelFormatter={(label)=>`Date: ${label}`}
              formatter={(value)=>`${value} hrs`}
            />

            <Bar dataKey="hours">

              {filteredData.map((entry,index)=>(
                <Cell
                  key={index}
                  fill={getColor(entry.hours)}
                />
              ))}

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}

export default DailyHours