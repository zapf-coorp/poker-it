const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function App() {
  return (
    <div>
      <h1>Poker Plan It</h1>
      <p>Planning Poker for agile teams.</p>
      <p>API: {apiUrl}</p>
    </div>
  );
}

export default App;
