function EventCard({ event, bookEvent }) {
  return (
    <div style={styles.card}>
      <h3>{event.name}</h3>
      <p>{event.date}</p>
      <p>{event.location}</p>

      <button onClick={() => bookEvent(event)}>Book Event</button>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
    width: "220px",
  },
};

export default EventCard;
