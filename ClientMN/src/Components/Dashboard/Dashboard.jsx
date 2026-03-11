import { useState, useEffect } from "react";

function Dashboard(){
    const [Hours, setHours] = useState(0)

    const fetchHours = async() =>{
        const response = await fetch("http://127.0.0.1:8000/analytics/daily")
        const data = await response.json()
        const TotalHours = data.reduce((sum, item) => sum + item.hours, 0);
        setHours(TotalHours.toFixed(2))
    }

    useEffect(() => {
        fetchHours();
    }, []);
    
    return(
        <div>
            <h2>Dashboard</h2>
            <p>Daily Hours:{Hours}</p>
        </div>
    )
}
export default Dashboard
