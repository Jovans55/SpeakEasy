import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState(true);

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

  const displayUsers = () => {
    setDisplayedUsers(!displayedUsers);
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

    socket.emit("join_room", { room, username });
    socket.emit("request_user_list", room);

    socket.on("user_list", (users) => {
      let uniqUsers = [];
      for (let i = 0; i < users.length; i++) {
        if (!uniqUsers.some((user) => user.id === users[i].id)) {
          uniqUsers.push(users[i]);
        }
      }
      setUserList(uniqUsers);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_list");
    };
  }, [socket, setMessageList, room, username]);

  return (
    <div className="chat-window">
      <header className="chat-header">
        <p>Welcome to {room} SpeakEasy!</p>
      </header>
      <div className="chatBodyHolder">
        <button onClick={displayUsers} style={{ border: "3px solid black" }}>
          Users
        </button>
        {displayedUsers && (
          <section className="users">
            <h3>Users:</h3>
            {userList.map((user, index) => (
              <p key={index}>{user.username}</p>
            ))}
          </section>
        )}
        <section className="chat-body">
          <h3
            style={{
              textAlign: "center",
              borderBottom: "5px solid rgba(0, 0, 0, 0.502)",
            }}
          >
            Start of chat history
          </h3>
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
