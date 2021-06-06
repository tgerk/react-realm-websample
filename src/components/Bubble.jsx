import React, { useEffect, useState } from "react";

export default function Bubble({ affordance, focusRef, ...props }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      focusRef?.current?.focus();
    }
  }, [focusRef, open]);

  if (!open) {
    return React.cloneElement(affordance, { onClick: () => setOpen(true) });
  }

  return (
    <div
      className="dropdown container"
      onBlur={({ currentTarget: us, relatedTarget: them }) => {
        if (!them || !us.contains(them)) {
          setOpen(false);
        }
      }}
    >
      <div className="dropdown content" {...props} />;
    </div>
  );
}
