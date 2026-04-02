import { BrowserRouter,Routes,Route } from "react-router-dom"

import Dashboard from "./pages/user/Dashboard"
import Events from "./pages/user/Events"
import Bookings from "./pages/user/Bookings"

import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageEvents from "./pages/admin/ManageEvents"

import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>

<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/events" element={<Events/>}/>
<Route path="/bookings" element={<Bookings/>}/>

<Route path="/admin/dashboard" element={<AdminDashboard/>}/>
<Route path="/admin/events" element={<ManageEvents/>}/>

</Routes>

</BrowserRouter>

)

}

export default App