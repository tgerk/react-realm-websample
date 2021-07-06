import React, { useEffect, useRef } from "react";

export default function Bubble({ affordance, children, open, ...props }) {
  const refAffordance = useRef(),
    refBubble = useRef(),
    refFocus = useRef();

  // use pure JS function to avoid re-renders on loss of focus
  // TL;DR of https://www.eventbrite.com/engineering/a-story-of-a-react-re-rendering-bug/
  //  the onBlur handler should not cause a re-render
  function showBubble() {
    if (refAffordance.current) {
      refAffordance.current.toggleAttribute("disabled");
    }
    if (refBubble.current) {
      refBubble.current.style.visibility = "visible";
    }
    refFocus.current?.focus();
  }

  function hideBubble({ currentTarget: us, relatedTarget: them }) {
    if (!them || !us.contains(them)) {
      if (refAffordance.current) {
        refAffordance.current.toggleAttribute("disabled");
      }
      if (refBubble.current) {
        refBubble.current.style.visibility = "hidden";
      }
    }
  }

  useEffect(() => {
    if (open) {
      showBubble();
    }
  }, [open]);

  return (
    <div className="bubble-root" {...props}>
      {React.cloneElement(affordance, {
        onClick: showBubble,
        ref: refAffordance,
      })}
      <div className="bubble-content" onBlur={hideBubble} ref={refBubble}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { refFocus })
        )}
      </div>
    </div>
  );
}
