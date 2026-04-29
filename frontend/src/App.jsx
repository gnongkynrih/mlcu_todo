import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Todo from "./pages/Todo";
import Test from "./pages/Test";

function Home() {
  return <h3>Home Page</h3>;
}
function App() {
  return (
    <>
      <BrowserRouter>
        <div>
          <Link to="/">Home</Link> |<Link to="/todo">Todo</Link>|
          <Link to="/testing">Test</Link>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/testing" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
