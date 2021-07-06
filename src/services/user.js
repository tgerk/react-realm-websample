import React, { useCallback, useContext, useState } from "react";

const SESSION_CURRENT_USER_KEY = "currentUser";

export const UserContext = React.createContext([null, () => {}]);

export default function UserContextProvider(props) {
  const [user, setUser] = useState(
      sessionStorage.getJSONItem(SESSION_CURRENT_USER_KEY, null)
    ),
    setCurrentUser = useCallback(
      (user) => {
        if (user) {
          sessionStorage.setJSONItem(SESSION_CURRENT_USER_KEY, user);
        } else {
          sessionStorage.removeItem(SESSION_CURRENT_USER_KEY);
        }

        setUser(user);
      },
      [setUser]
    ),
    onAuthError = useCallback(
      (authError) => setCurrentUser({ ...user, authError }),
      [user, setCurrentUser]
    );

  return (
    <UserContext.Provider
      value={[user, setCurrentUser, onAuthError]}
      {...props}
    />
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
