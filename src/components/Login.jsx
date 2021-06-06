import React, { useState, useContext, useRef } from "react";

import Bubble from "Bubble";

import { UserContext } from "services/user";

export function Login({ focusRef }) {
  const [currentUser, setCurrentUser] = useContext(UserContext),
    [user, setUser] = useState(currentUser || {}),
    { userName, userId } = user;

  const updateUser = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  function handleLogin(event) {
    event.preventDefault();
    setCurrentUser(user);
  }

  return (
    <form className="login" onSubmit={handleLogin}>
      <div>
        <label htmlFor="user">Username</label>
        <input
          id="name"
          name="name"
          type="text"
          value={userName}
          onChange={updateUser}
          ref={focusRef}
          required
        />
      </div>

      <div>
        <label htmlFor="id">ID</label>
        <input
          id="id"
          name="id"
          type="text"
          value={userId}
          onChange={updateUser}
          required
        />
      </div>

      <button name="submit" onClick={handleLogin}>
        Login
      </button>
    </form>
  );
}

export function Logout() {
  const [currentUser, setCurrentUser] = useContext(UserContext);

  function handleLogout(event) {
    event.preventDefault();
    setCurrentUser(null);
  }

  return (
    <form className="logout" onSubmit={handleLogout}>
      <button name="submit" onClick={handleLogout}>
        Logout {currentUser.name}
      </button>
    </form>
  );
}

export default function UserLogin() {
  const [currentUser] = useContext(UserContext),
    focusRef = useRef();

  if (currentUser) {
    return <Logout />;
  }

  return (
    <Bubble affordance={<button>Login</button>} focusRef={focusRef}>
      <Login focusRef={focusRef} />
    </Bubble>
  );
}
