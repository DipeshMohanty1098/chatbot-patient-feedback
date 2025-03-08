import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import TileA from './tileA';
import TileB from './tileB';
import Chatbot from "./chatbot";

function Home() {
    const navigate = useNavigate();
    return (
      <div className="p-6">
        <Chatbot />
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <div className="flex gap-4 justify-center mt-4">
          <div className="cursor-pointer" onClick={() => navigate("/tile-a")}>
            <TileA />
          </div>
          <div className="cursor-pointer" onClick={() => navigate("/tile-b")}>
            <TileB />
          </div>
        </div>
      </div>
    );
  }

export default Home;