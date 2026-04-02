import { useState } from "react"

function ManageEvents(){

const [events,setEvents] = useState([])
const [name,setName] = useState("")

const addEvent = () => {

const newEvent={
id:Date.now(),
name
}

setEvents([...events,newEvent])
setName("")

}

const deleteEvent = (id)=>{
setEvents(events.filter(e=>e.id!==id))
}

return(

<div style={{padding:"30px"}}>

<h2>Manage Events</h2>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Event name"
/>

<button onClick={addEvent}>Add</button>

<ul>

{events.map(event=>(
<li key={event.id}>

{event.name}

<button onClick={()=>deleteEvent(event.id)}>
Delete
</button>

</li>
))}

</ul>

</div>

)

}

export default ManageEvents