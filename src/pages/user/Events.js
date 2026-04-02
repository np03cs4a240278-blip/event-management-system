import { useState } from "react"
import EventCard from "../../components/EventCard"

function Events(){

const [events] = useState([
{
id:1,
name:"Wedding Event",
date:"12 June",
location:"New York"
},
{
id:2,
name:"Birthday Party",
date:"18 July",
location:"Los Angeles"
},
{
id:3,
name:"Corporate Event",
date:"25 August",
location:"Chicago"
}
])

const bookEvent = (event)=>{
alert("Booked: " + event.name)
}

return(

<div style={{padding:"30px"}}>

<h2>Available Events</h2>

<div style={{display:"flex",gap:"20px"}}>

{events.map(event=>(
<EventCard
key={event.id}
event={event}
bookEvent={bookEvent}
/>
))}

</div>

</div>

)

}

export default Events