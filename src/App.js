import { useState } from "react";
// import Login from "./Components/Login";
import Register from "./Components/Register";
import { DatePicker, Space } from "antd";

function App() {
  const [showLogin, setShowLogin] = useState(true);

  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };
  return (
    <div>
      <Space vertical>
        <DatePicker onChange={onChange} />
        <DatePicker onChange={onChange} picker="week" />
        <DatePicker onChange={onChange} picker="month" />
        <DatePicker onChange={onChange} picker="quarter" />
        <DatePicker onChange={onChange} picker="year" />
      </Space>
      {showLogin ? <Login /> : <Register />}

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        {showLogin ? (
          <p>
            Don’t have an account?{" "}
            <button onClick={() => setShowLogin(false)}>Register</button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button onClick={() => setShowLogin(true)}>Login</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
