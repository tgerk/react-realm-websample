import React, { useState, useContext } from "react";

import Bubble from "Bubble";

import { UserContext } from "services/user";

export default function User() {
  const [currentUser, setCurrentUser] = useContext(UserContext);

  function Logout() {
    function handleLogout() {
      setCurrentUser(null);
    }

    return (
      <button className="logout" name="submit" onClick={handleLogout}>
        Logout {currentUser.name}
      </button>
    );
  }

  if (currentUser) {
    return <Logout />;
  }

  function Login({ refFocus }) {
    const [user, setUser] = useState(currentUser || {}),
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
            ref={refFocus}
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

  return (
    <Bubble affordance={<button>Login</button>}>
      <Login />
    </Bubble>
  );
}
