import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
    const messageId = Math.floor(Math.random() * 3587);

    const messageData = {
      id: messageId,
      room: room,
      username: username,
      message: message,
      time: formattedTime,
    };

    await socket.emit("send_message", messageData);
    setMessageList((list) => [...list, messageData]);
    setMessage("");
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => {
        const newList = [...list];
        const existingMessage = newList.find(
          (message) =>
            message.username === data.username &&
            message.message === data.message
        );
        if (!existingMessage) {
          newList.push(data);
        }
        return newList;
      });
    });
  }, [socket, setMessageList]);

  return (
    <div className="chat-window">
      <header className="chat-header">
        <p>Welcome to {room} SpeakEasy!</p>
      </header>
      <div className="chatBodyHolder">
        <section className="rooms">
          <p>Users: {room}</p>
        </section>
        <section className="chat-body">
          {messageList.map((data) => {
            return (
              <div
                key={data.id}
                className="message"
                id={username === data.username ? "you" : "other"}
              >
                {username === data.username ? (
                  <div className="messageDiv">
                    <p className="message-meta" id="author">
                      {data.username}:
                    </p>
                    <span className="message-content">{data.message}</span>
                    <span className="message-meta" id="time">
                      {data.time}
                    </span>
                  </div>
                ) : (
                  <div className="messageDiv">
                    <p className="message-meta" id="author">
                      {data.username}:
                    </p>
                    <span className="message-content">{data.message}</span>
                    <span className="message-meta" id="time">
                      {data.time}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
      <footer className="chat-footer">
        <input
          type="text"
          value={message}
          placeholder="Type here..."
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyUp={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>send</button>
      </footer>
    </div>
  );
}

export default Chat;
