import { useState } from "react"
import API from "../services/api"

function Signup(){

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [phone,setPhone] = useState("")
  const [address,setAddress] = useState("")
  const [password,setPassword] = useState("")
  const [confirmPassword,setConfirmPassword] = useState("")

  const handleSignup = async (e)=>{

    e.preventDefault()

    if(password !== confirmPassword){
      alert("Passwords do not match")
      return
    }

    try{

      await API.post("register.php",{
        name,
        email,
        phone,
        address,
        password
      })

      alert("Account created successfully")

      window.location="/"

    }catch{

      alert("Signup failed")

    }

  }

  return(

    <div style={styles.page}>

      <div style={styles.header}></div>

      <div style={styles.card}>

        <h2 style={styles.title}>Create Account</h2>

        <form onSubmit={handleSignup}>

          {/* Full Name */}
          <div style={styles.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* Phone */}
          <div style={styles.inputGroup}>
            <label>Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* Address */}
          <div style={styles.inputGroup}>
            <label>Address</label>
            <textarea
              placeholder="Enter your address"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
              style={styles.textarea}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button style={styles.button}>
            Sign Up
          </button>

        </form>

        <p style={styles.links}>
          Already have an account? <a href="/">Login</a>
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
    width:"360px",
    boxShadow:"0 5px 20px rgba(0,0,0,0.1)",
    position:"relative",
    zIndex:2
  },

  title:{
    textAlign:"center",
    marginBottom:"20px"
  },

  inputGroup:{
    marginBottom:"15px"
  },

  input:{
    width:"100%",
    border:"none",
    borderBottom:"2px solid #A5B4FC",
    padding:"8px",
    outline:"none"
  },

  textarea:{
    width:"100%",
    border:"2px solid #A5B4FC",
    borderRadius:"6px",
    padding:"8px",
    outline:"none"
  },

  button:{
    width:"100%",
    background:"#A5B4FC",
    border:"none",
    padding:"10px",
    borderRadius:"8px",
    color:"#fff",
    fontWeight:"bold",
    cursor:"pointer",
    marginTop:"10px"
  },

  links:{
    marginTop:"15px",
    textAlign:"center",
    fontSize:"14px"
  }

}

export default Signup