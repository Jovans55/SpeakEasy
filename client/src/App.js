import React, { useState } from "react";
import io from "socket.io-client";
import Chat from "./Chat";
import "./App.css";

const socket = io.connect("http://localhost:3001/");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const leaveRoom = () => {
    if (room !== "") {
      socket.emit("leave_room", room);
      setShowChat(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <>
          <p style={{ color: "#f5f5f5", fontSize: "125%" }}>
            Don't know what room to join? Join main! 🥳
          </p>
          <div className="joinChatContainer">
            <h3 style={{ color: "#f5f5f5", fontSize: "150%" }}>
              Join A SpeakEasy 🦔
            </h3>
            <input
              type="text"
              placeholder="Display Name..."
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              onKeyUp={handleKeyPress}
            />
            <input
              type="text"
              placeholder="SpeakEasy Code..."
              onChange={(e) => {
                setRoom(e.target.value);
              }}
              onKeyUp={handleKeyPress}
            />
            <button onClick={joinRoom}>Start Chatting!</button>
          </div>
        </>
      ) : (
        <>
          <Chat socket={socket} username={username} room={room} />
          <button onClick={leaveRoom} id="leaveBtn">
            Leave room
          </button>
        </>
      )}
    </div>
  );
}

export default App;
