<<<<<<< HEAD
=======
<<<<<<< HEAD
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
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, bookings: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
<<<<<<< HEAD
=======

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    const loadStats = async () => {
      try {
        const [eventsResponse, bookingsResponse] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
        ]);
<<<<<<< HEAD
        if (isActive) {
          setStats({ events: eventsResponse.data.events?.length ?? 0, bookings: bookingsResponse.data.bookings?.length ?? 0 });
        }
      } catch (requestError) {
        if (isActive) setError(getErrorMessage(requestError, "Could not load dashboard stats."));
      }
    };
    loadStats();
    return () => { isActive = false; };
  }, []);

  return (
    <AppShell subtitle="Track upcoming events and keep an eye on your booking activity." title="Dashboard">
      <section className="hero-card">
        <p className="eyebrow">Welcome</p>
        <h2>{user?.name}</h2>
        <p>Browse available events, make bookings, and come back here anytime to review your activity.</p>
      </section>
      {error ? <p className="message message-error">{error}</p> : null}
      <section className="stats-grid">
        <article className="stat-card"><span className="stat-card__label">Available events</span><strong>{stats.events}</strong></article>
        <article className="stat-card"><span className="stat-card__label">Your bookings</span><strong>{stats.bookings}</strong></article>
=======

        if (isActive) {
          setStats({
            events: eventsResponse.data.events?.length ?? 0,
            bookings: bookingsResponse.data.bookings?.length ?? 0,
          });
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError, "Could not load dashboard stats."));
        }
      }
    };

    loadStats();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AppShell
      subtitle="Track upcoming events and keep an eye on your booking activity."
      title="Dashboard"
    >
      <section className="hero-card">
        <p className="eyebrow">Welcome</p>
        <h2>{user?.name}</h2>
        <p>
          Browse available events, make bookings, and come back here anytime to review your activity.
        </p>
      </section>

      {error ? <p className="message message-error">{error}</p> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">Available events</span>
          <strong>{stats.events}</strong>
        </article>

        <article className="stat-card">
          <span className="stat-card__label">Your bookings</span>
          <strong>{stats.bookings}</strong>
        </article>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
      </section>
    </AppShell>
  );
}

export default Dashboard;
<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
