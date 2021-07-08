import React, { useState } from "react";

import Bubble from "Bubble";
import Error from "Error";
import OidcLoginProviders from "OpenIDLogin";

import { useCurrentUser } from "services/user";
import { useRealm } from "services/realm";

// Login & Logout functional components are local,
//  these are no longer reusable, but that's not my concern here
export default function User() {
  const [currentUser, setCurrentUser, [authError]] = useCurrentUser();

  function Logout() {
    const [{ user }] = useRealm(),
      name =
        user?.profile?.username || user?.profile?.name || user?.profile?.email;

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
    const [user, setUser] = useState(currentUser),
      { email = "", password = "" } = user,
      [emailLogin, showEmailLogin] = useState(false),
      updateUser = ({ target: { name, value } }) => {
        setUser({ ...user, [name]: value });
      };

    function handleLogin(event) {
      event.preventDefault();
      setCurrentUser(user);
    }

    if (emailLogin) {
      return (
        <form id="login" onSubmit={handleLogin}>

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

    return (
      <OidcLoginProviders>
        <button
          onClick={() => {
            showEmailLogin(true);
          }}
        >
          Login with email
        </button>
      </OidcLoginProviders>
    );
  }

  if (currentUser && !authError) {
    return <Logout />;
  }

  return (
    <Bubble affordance={<button>Login</button>} open={!!authError}>
      <Error error={authError} />
      <Login />
    </Bubble>
  );
}
