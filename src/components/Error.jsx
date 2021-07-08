import React from "react";

export default function Error({ error }) {
  // LATER:  glam it up, grrrl
  if (error) {
    return <div className="user-error">{error}</div>;
  }

  return null;
}
