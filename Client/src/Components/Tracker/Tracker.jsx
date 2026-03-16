import { useState } from "react"
import "./Tracker.css"

const TIMETRACKER_SHEET =
"https://docs.google.com/spreadsheets/d/1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM/edit?usp=sharing"

function Tracker(){
    const [loading,setLoading] = useState(false)
    const runPipeline = async () => {
        try{
            setLoading(true)
            await fetch("/pipeline/run",{
                method:"POST"
            })
            alert("Pipeline executed successfully")
        }
        catch(err){
            console.error(err)
            alert("Pipeline failed")
        }
        finally{
            setLoading(false)
        }
    }

    return(
        <div className="tracker">
            <div className="sheet-container">
                <h3>Time Tracker</h3>
                <iframe src={TIMETRACKER_SHEET} className="sheet-frame" />
            </div>
        </div>
    )
}

export default Tracker