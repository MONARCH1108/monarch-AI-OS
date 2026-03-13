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

import "./WeeklyHours.css"

const API = "/analytics/weekly"

function WeeklyHours(){

  const [data,setData] = useState([])
  const [filtered,setFiltered] = useState([])

  const [month,setMonth] = useState(new Date().getMonth()+1)
  const [year,setYear] = useState(new Date().getFullYear())

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]

  useEffect(()=>{
    fetch(API)
      .then(res=>res.json())
      .then(res=>setData(res))
  },[])

  useEffect(()=>{

    const filteredData = data.filter(d => {

      const date = new Date(d.start_date)
      const itemMonth = date.getMonth()+1
      const itemYear = d.iso_year

      return itemMonth === Number(month) && itemYear === Number(year)

    })

    setFiltered(filteredData)

  },[data,month,year])


  return(

    <div className="weekly-card">

      {/* HEADER */}

      <div className="weekly-header">

        <div className="weekly-title">
          Weekly Hours
        </div>

        <div className="weekly-filters">

          <select
            value={month}
            onChange={(e)=>setMonth(e.target.value)}
          >
            {months.map((m,i)=>(
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e)=>setYear(e.target.value)}
          >
            {[2024,2025,2026,2027].map(y=>(
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

        </div>

      </div>

      {/* CHART */}

      <div className="weekly-chart">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={filtered}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="iso_week"
              tickFormatter={(w)=>`W${w}`}
            />

            <YAxis/>

            <Tooltip
              labelFormatter={(label)=>`Week ${label}`}
              formatter={(v)=>`${v} hrs`}
            />

            <Bar
              dataKey="hours"
              fill="#3b82f6"
              radius={[4,4,0,0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  )
}

export default WeeklyHours