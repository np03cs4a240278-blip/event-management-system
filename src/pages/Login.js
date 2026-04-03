import { useState } from "react"
import API from "../services/api"

function Login(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [role,setRole] = useState("user")

  const handleLogin = async (e) => {

    e.preventDefault()

    try{

      const res = await API.post("login.php",{
        email,
        password,
        role
      })

      localStorage.setItem("token",res.data.token)

      if(role === "admin"){
        window.location="/admin/dashboard"
      }else{
        window.location="/events"
      }

    }catch{

      alert("Login failed")

    }

  }

  return(

    <div style={styles.page}>

      <div style={styles.header}></div>

      <div style={styles.card}>

        <h2 style={styles.title}>Login Now</h2>

        {/* Role Selector */}
        <div style={styles.roleSelector}>

          <button
            style={role==="user"?styles.activeRole:styles.roleBtn}
            onClick={()=>setRole("user")}
            type="button"
          >
            User
          </button>

          <button
            style={role==="admin"?styles.activeRole:styles.roleBtn}
            onClick={()=>setRole("admin")}
            type="button"
          >
            Admin
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <div style={styles.inputGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.forgot}>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          {/* ONE LOGIN BUTTON */}
          <button style={styles.loginBtn}>
            Login
          </button>

        </form>

        <p style={styles.links}>
          New here? <a href="/signup">Create an Account</a>
        </p>

      </div>

    </div>

  )

}

const styles = {

  page:{
    height:"100vh",
    background:"#F8F9FD",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center"
  },

  header:{
    position:"absolute",
    top:0,
    width:"100%",
    height:"300px",
    background:"linear-gradient(135deg,#FBCFE8,#A5B4FC)",
    borderBottomLeftRadius:"50% 20%",
    borderBottomRightRadius:"50% 20%"
  },

  card:{
    background:"#fff",
    padding:"40px",
    borderRadius:"12px",
    width:"350px",
    boxShadow:"0 5px 20px rgba(0,0,0,0.1)",
    position:"relative",
    zIndex:2
  },

  title:{
    textAlign:"center",
    marginBottom:"20px"
  },

  roleSelector:{
    display:"flex",
    justifyContent:"center",
    marginBottom:"20px",
    gap:"10px"
  },

  roleBtn:{
    padding:"8px 20px",
    border:"1px solid #A5B4FC",
    background:"#fff",
    borderRadius:"20px",
    cursor:"pointer"
  },

  activeRole:{
    padding:"8px 20px",
    border:"none",
    background:"#7C6CF5",
    color:"#fff",
    borderRadius:"20px",
    cursor:"pointer"
  },

  inputGroup:{
    marginBottom:"20px"
  },

  input:{
    width:"100%",
    border:"none",
    borderBottom:"2px solid #A5B4FC",
    padding:"8px",
    outline:"none"
  },

  forgot:{
    textAlign:"right",
    marginBottom:"15px",
    fontSize:"14px"
  },

  loginBtn:{
    width:"100%",
    background:"#7C6CF5",
    border:"none",
    padding:"10px",
    borderRadius:"8px",
    color:"#fff",
    fontWeight:"bold",
    cursor:"pointer"
  },

  links:{
    marginTop:"15px",
    textAlign:"center",
    fontSize:"14px"
  }

}

export default Login