import React from "react";

export default function Error({ error }) {
  // LATER:  glam it up, grrrl
  return <div className="user-info error">{JSON.stringify(error)}</div>;
}
