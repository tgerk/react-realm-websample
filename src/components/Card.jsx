import React from "react";

export default function Card({ title, subtitle, text, actions = [] }) {
  return (
    <article className="card">
      {title && <h1>{title}</h1>}
      {subtitle && <h2>{subtitle}</h2>}
      <section>{text}</section>
      <aside>
        {actions.map((action, i) => React.cloneElement(action, { key: i }))}
      </aside>
    </article>
  );
}
