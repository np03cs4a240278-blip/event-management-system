import { Link } from "react-router-dom"

function AdminDashboard(){

return(

<div style={{padding:"30px"}}>

<h2>Admin Dashboard</h2>

<div style={{display:"flex",gap:"20px"}}>

<div style={styles.card}>
<h3>Manage Events</h3>
<Link to="/admin/events">Open</Link>
</div>

</div>

</div>

)

}

const styles={

card:{
background:"linear-gradient(135deg,#E9D5FF,#C7D2FE)",
padding:"30px",
borderRadius:"10px"
}

}

export default AdminDashboard