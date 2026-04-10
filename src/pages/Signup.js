<<<<<<< HEAD
=======
<<<<<<< HEAD
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
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";

function Signup() {
  const navigate = useNavigate();
  const { user, loading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
<<<<<<< HEAD
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && user) {
<<<<<<< HEAD
      navigate(user.role === "admin" ? "/admin/dashboard" : "/events", { replace: true });
=======
      navigate(user.role === "admin" ? "/admin/dashboard" : "/events", {
        replace: true,
      });
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    }
  }, [loading, navigate, user]);

  const handleSignup = async (event) => {
    event.preventDefault();
<<<<<<< HEAD
=======

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }
<<<<<<< HEAD
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    try {
      await register({ name, email, phone, address, password });
      setFeedback({ type: "success", text: "Account created successfully. Please login to continue." });
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Signup failed.") });
=======

    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      await register({ name, email, password });
      setFeedback({ type: "success", text: "Account created successfully. Redirecting to login..." });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Signup failed."),
      });
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <p className="eyebrow">Create your account</p>
        <h1>Join Event</h1>
        <p className="auth-subtitle">Register as a user to explore events and manage your bookings.</p>

        {feedback.text ? (
          <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
            {feedback.text}
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSignup}>
          <label className="field">
<<<<<<< HEAD
            <span>Register as</span>
            <input value="User" disabled type="text" style={{ color: "var(--muted)", background: "rgba(0,0,0,0.04)" }} />
          </label>

          <label className="field">
            <span>Full name</span>
            <input
              onChange={(e) => setName(e.target.value)}
=======
            <span>Full name</span>
            <input
              onChange={(inputEvent) => setName(inputEvent.target.value)}
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
              placeholder="Enter your full name"
              required
              type="text"
              value={name}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
<<<<<<< HEAD
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
=======
              onChange={(inputEvent) => setEmail(inputEvent.target.value)}
              placeholder="you@example.com"
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
<<<<<<< HEAD
            <span>Phone number</span>
            <input
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9800000000"
              required
              type="tel"
              value={phone}
            />
          </label>

          <label className="field">
            <span>Address</span>
            <input
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your city or full address"
              required
              type="text"
              value={address}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
=======
            <span>Password</span>
            <input
              onChange={(inputEvent) => setPassword(inputEvent.target.value)}
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
              placeholder="Minimum 6 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
<<<<<<< HEAD
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
=======
              onChange={(inputEvent) => setConfirmPassword(inputEvent.target.value)}
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
              placeholder="Repeat your password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <button className="button auth-button" disabled={submitting || loading} type="submit">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
