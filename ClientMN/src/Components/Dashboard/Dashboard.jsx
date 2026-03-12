import { useState, useEffect } from "react";

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
        const response = await fetch("http://127.0.0.1:8000/analytics/daily")
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
            <h2>Dashboard</h2>
            <p>Daily Hours:{Hours}</p>
            <p>Working Days Logged: {DaysWorked}</p>

            <p>Current Streak: {CurrentStreak} days</p>
            <p>From: {CurrentStart} → {CurrentEnd}</p>

            <p>Longest Streak: {LongestStreak} days</p>
            <p>From: {LongestStart} → {LongestEnd}</p>
        </div>
    )
}
export default Dashboard
