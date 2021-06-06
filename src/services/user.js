import React, { useState } from "react";

const SESSION_CURRENT_USER_KEY = "currentUser";

export const UserContext = React.createContext([null, () => {}]);

export default function UserContextProvider(props) {
  const [user, setUser] = useState(
    sessionStorage.getJSONItem(SESSION_CURRENT_USER_KEY, null)
  ); // components access current user through context

  function setCurrentUser(user) {
    if (user) {
      sessionStorage.setJSONItem(SESSION_CURRENT_USER_KEY, user);
    } else {
      sessionStorage.removeItem(SESSION_CURRENT_USER_KEY);
    }

    setUser(user);
  }

  return <UserContext.Provider value={[user, setCurrentUser]} {...props} />;
}
