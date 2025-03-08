import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Chatbot from "./components/chatbot";
import TileA from "./components/tileA";
import TileB from "./components/tileB";
import Home from "./components/tiles";

const RoutePage = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tile-a" element={<TileA />} />
        <Route path="/tile-b" element={<TileB />} />
      </Routes>
    </Router>
  );
}

export default RoutePage;