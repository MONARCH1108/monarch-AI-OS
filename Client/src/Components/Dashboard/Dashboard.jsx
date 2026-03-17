import { useState, useEffect } from "react";
import './Dashboard.css'
import DailyHours from "./Charts/DailyHours";
import WeeklyHours from "./Charts/WeeklyHours";
import MonthlyHours from "./Charts/MonthlyHours";
import Split from "react-split"

function Dashboard(){
    const [Hours, setHours] = useState(0)
    const [DaysWorked, setDaysWorked] = useState(0);
    const [CurrentStreak, setCurrentStreak] = useState(0);
    const [LongestStreak, setLongestStreak] = useState(0);
    const [CurrentStart, setCurrentStart] = useState(null);
    const [CurrentEnd, setCurrentEnd] = useState(null);
    const [LongestStart, setLongestStart] = useState(null);
    const [LongestEnd, setLongestEnd] = useState(null);

    const fetchHours = async() =>{
        const response = await fetch("https://productivity-api-b5hg.onrender.com/analytics/daily")
        const data = await response.json()

        // Total hours
        const TotalHours = data.reduce((sum, item) => sum + item.hours, 0);

        // Working days
        const WorkingDays = data.filter(item => item.hours > 0).length;

        // Longest streak calculation
        let longest = 0;
        let temp = 0;
        let longestStart = null;
        let longestEnd = null;
        let tempStart = null;
        for (let i = 0; i < data.length; i++) {
            if (data[i].hours > 0) { 
                if (temp === 0) {
                    tempStart = data[i].date;
                }
                temp++;
                if (temp > longest) {
                    longest = temp;
                    longestStart = tempStart;
                    longestEnd = data[i].date;
                }
            } else {
                temp = 0;
                tempStart = null;
            }
        }

        // Current streak (count from end backwards)
        let current = 0;
        let currentStart = null;
        let currentEnd = null;            
        for (let i = data.length - 1; i >= 0; i--) {        
            if (data[i].hours > 0) {            
                current++;
           
                if (!currentEnd) {
                    currentEnd = data[i].date;
                }
           
                currentStart = data[i].date;            
            } else {
                break;
            }        
        }

        setHours(Number(TotalHours.toFixed(2)));
        setDaysWorked(WorkingDays);
        setCurrentStreak(current);
        setLongestStreak(longest);
        setCurrentStart(currentStart);
        setCurrentEnd(currentEnd);    
        setLongestStart(longestStart);
        setLongestEnd(longestEnd);
    }

    useEffect(() => {
        fetchHours();
    }, []);
    
    return(
        <div>
            <div className="dashboard">
                <div className="metrics-row">

                    <div className="metric-card">
                        <h3>Total Hours Logged</h3>
                        <p>{Hours}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Working Days</h3>
                        <p>{DaysWorked}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Current Streak</h3>
                        <p>{CurrentStreak} days</p>
                        <small>
                            {CurrentStart} → {CurrentEnd}
                        </small>
                    </div>

                    <div className="metric-card">
                        <h3>Best Streak</h3>
                        <p>{LongestStreak} days</p>
                        <small>
                            {LongestStart} → {LongestEnd}
                        </small>
                    </div>

                </div>
            </div>
            <div className="chart-section">
              <Split className="split" sizes={[60, 40]} minSize={300} gutterSize={10}>
                <div>
                  <MonthlyHours />
                </div>
                <div className="weekly-monthly-card">
                <WeeklyHours />
                </div>
              </Split>
            </div>
            <div className="daily-full">
            
                <DailyHours />
            </div>
        </div>
    )
}
export default Dashboard
