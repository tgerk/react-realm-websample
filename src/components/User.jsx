import React, { useState } from "react";

import Bubble from "Bubble";
import Error from "Error";

import { useCurrentUser } from "services/user";
import { useRealm } from "services/realm";

// Login & Logout functional components are local,
//  these are no longer reusable, but that's not my concern here
export default function User() {
  const [currentUser, setCurrentUser] = useCurrentUser();
  const [{ user: realmUser }] = useRealm();

  function Logout({ name }) {
    function handleLogout() {
      setCurrentUser();
    }
    return (
      <button className="logout" name="submit" onClick={handleLogout}>
        Logout {name}
      </button>
    );
  }

  function Login({ refFocus }) {
    const [user, setUser] = useState(currentUser || {}),
      { email, password, authError: error } = user;

    const updateUser = ({ target: { name, value } }) => {
      setUser({ ...user, [name]: value });
    };

    function handleLogin(event) {
      event.preventDefault();

      // LATER dispatch to login page of selected OIDC providers, else

      setCurrentUser(user);
    }

    return (
      <form id="login" onSubmit={handleLogin}>
        {error && <Error error={error} />}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={updateUser}
            ref={refFocus}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
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

  if (currentUser) {
    return (
      <Logout name={realmUser?.profile.name || realmUser?.profile.email} />
    );
  }

  return (
    <Bubble affordance={<button>Login</button>} open={!!currentUser?.authError}>
      <Login />
    </Bubble>
  );
}
