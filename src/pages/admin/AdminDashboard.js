import Sidebar from "../../components/Sidebar"
import Navbar from "../../components/Navbar"

function AdminDashboard(){

  return(

    <div style={{display:"flex"}}>

      <Sidebar role="admin"/>

      <div style={{flex:1}}>

        <Navbar/>

        <div style={{padding:"30px"}}>

          <h1>Admin Dashboard</h1>

          <p>Welcome Admin. Manage your events here.</p>

        </div>

      </div>

    </div>

  )

}

export default AdminDashboard