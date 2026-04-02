import Sidebar from "../../components/Sidebar"
import Navbar from "../../components/Navbar"
import "../../styles/dashboard.css"

function Dashboard(){

return(

<div style={{display:"flex"}}>

<Sidebar/>

<div style={{flex:1}}>

<Navbar/>

<div style={{padding:"30px"}}>

<h2>Dashboard</h2>

<p>Welcome to Event Management System</p>

</div>

</div>

</div>

)

}

export default Dashboard