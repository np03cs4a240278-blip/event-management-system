import "../styles/navbar.css"
function Navbar(){

return(

<div style={styles.navbar}>

<input placeholder="Search events..." style={styles.search}/>

<button style={styles.button}>
Create Event
</button>

</div>

)

}

const styles={

navbar:{
display:"flex",
justifyContent:"space-between",
padding:"20px",
background:"white"
},

search:{
padding:"8px",
borderRadius:"6px",
border:"1px solid #ddd"
},

button:{
background:"#C4B5FD",
border:"none",
padding:"10px 15px",
borderRadius:"6px",
color:"white"
}

}

export default Navbar