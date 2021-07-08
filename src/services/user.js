import React, { useCallback, useContext, useState } from "react";

const UserContext = React.createContext([null, () => {}]),
  SESSION_CURRENT_USER_KEY = "currentUser";

export default function UserContextProvider(props) {
  const [user, setUser] = useState(
      sessionStorage.getJSONItem(SESSION_CURRENT_USER_KEY, null)
    ),
    [authError, setAuthError] = useState(),
    setCurrentUser = useCallback(
      // cache authenticated user data in session storage
      (user) => {
        if (user && Object.keys(user).length) {
          sessionStorage.setJSONItem(SESSION_CURRENT_USER_KEY, user);
        } else {
          sessionStorage.removeItem(SESSION_CURRENT_USER_KEY);
        }

        setAuthError(); // clear prior errors
        setUser(user);
      },
      [setUser]
    );

  return (
    <UserContext.Provider
      value={[user, setCurrentUser, [authError, setAuthError]]}
      {...props}
    />
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
