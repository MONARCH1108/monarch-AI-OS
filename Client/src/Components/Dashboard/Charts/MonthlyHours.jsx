import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import "./MonthlyHours.css"
const API = "http://127.0.0.1:8000/analytics/monthly"

function MonthlyHours(){
  const [data,setData] = useState([])
  const [filtered,setFiltered] = useState([])
  const [year,setYear] = useState(new Date().getFullYear())
  const [years,setYears] = useState([])
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ]
  useEffect(()=>{
    fetch(API)
      .then(res=>res.json())
      .then(res=>{
        setData(res)
        const uniqueYears = [
          ...new Set(res.map(d => d.year))
        ].sort((a,b)=>b-a)
        setYears(uniqueYears)
      })
  },[])

  useEffect(()=>{
    const filteredData = data.filter(d => d.year === Number(year))
    setFiltered(filteredData)
  },[data,year])

  return(
    <div className="monthly-card">
      {/* HEADER */}
      <div className="monthly-header">
        <div className="monthly-title">
          Monthly Hours
        </div>
        <div className="monthly-filters">
          <select value={year} onChange={(e)=>setYear(e.target.value)}>
            {years.map(y=>(
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CHART */}
      <div className="monthly-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} margin={{ top: 10, right: 5, left: -30, bottom: -5 }}>
                  
            <CartesianGrid
              stroke="#1f1f1f"
              strokeDasharray="4 4"
              vertical={false}
            />
        
            <XAxis
              dataKey="month"
              tickFormatter={(m)=>months[m-1]}
              stroke="#888"
              tick={{ fill:"#aaa", fontSize:12 }}
            />
        
            <YAxis
              stroke="#888"
              tick={{ fill:"#aaa", fontSize:12 }}
            />
        
            <Tooltip
              contentStyle={{
                background:"#0a0a0a",
                border:"1px solid #d4af37",
                borderRadius:"8px",
                color:"#fff"
              }}
              labelFormatter={(label)=>months[label-1]}
              formatter={(v)=>`${v} hrs`}
            />
        
            <Bar
              dataKey="hours"
              fill="#d4af37"
              radius={[20,20,6,6]}
            />
        
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  )

}

export default MonthlyHours