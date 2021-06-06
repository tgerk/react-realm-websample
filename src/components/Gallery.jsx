import React from "react";

export default function Gallery({
  page,
  total,
  prev,
  next,
  children,
  ...props
}) {
  return (
    <div className="gallery" {...props}>
      {(page || total || prev || next) && (
        <div className="gallery-nav">
          {page && <span className="page">{page}</span>}
          {total && <span className="total">{total}</span>}
          {prev && (
            <a className="prevPage" href={prev}>
              &lt;
            </a>
          )}
          {next && (
            <a className="nextPage" href={next}>
              &gt;
            </a>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
