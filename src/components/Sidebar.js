import { Link } from "react-router-dom"
import "../styles/sidebar.css"

function Sidebar(){

return(

<div style={styles.sidebar}>

<h2 style={styles.logo}>EventPro</h2>

<ul style={styles.menu}>

<li><Link to="/dashboard">Dashboard</Link></li>
<li><Link to="/events">Events</Link></li>
<li><Link to="/bookings">Bookings</Link></li>
<li><Link to="/admin/dashboard">Admin</Link></li>

</ul>

</div>

)

}

const styles = {

sidebar:{
width:"220px",
height:"100vh",
background:"white",
padding:"20px",
boxShadow:"2px 0 10px rgba(0,0,0,0.05)"
},

logo:{
color:"#A78BFA"
},

menu:{
listStyle:"none",
lineHeight:"40px",
padding:0
}

}

export default Sidebar