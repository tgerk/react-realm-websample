import React from "react";
import { Link } from "react-router-dom";

export default function Gallery({
  page,
  total,
  first,
  prev,
  next,
  last,
  children,
  ...props
}) {
  return (
    <div className="gallery" {...props}>
      {(page || total || first || prev || next || last) && (
        <div className="gallery-nav">
          <span>
            {page && <span className="page">{page}</span>}
            {total && <span className="total">{total}</span>}
          </span>
          {first && (
            <Link className="firstPage" to={first}>
              &#x21e4;
            </Link>
          )}
          {last && (
            <Link className="lastPage" to={last}>
              &#x21e5;
            </Link>
          )}
          {prev && (
            <Link className="prevPage" to={prev}>
              &larr;
            </Link>
          )}
          {next && (
            <Link className="nextPage" to={next}>
              &rarr;
            </Link>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
