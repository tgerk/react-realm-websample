import React, { useEffect, useRef } from "react";

export default function Bubble({ affordance, children, open, ...props }) {
  const refAffordance = useRef(),
    refContent = useRef(),
    refFocus = useRef();

  // use pure JS function to avoid re-renders on loss of focus
  // TL;DR of https://www.eventbrite.com/engineering/a-story-of-a-react-re-rendering-bug/
  //  the onBlur handler should not cause a re-render
  function showBubble() {
    refAffordance.current?.toggleAttribute("disabled");
    refContent.current?.toggleAttribute("hidden");
    refFocus.current?.focus();
  }

  function hideBubble({ currentTarget: us, relatedTarget: them }) {
    if (!them || !us.contains(them)) {
      refAffordance.current?.toggleAttribute("disabled");
      refContent.current?.toggleAttribute("hidden");
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
      <div
        className="bubble-content"
        hidden
        onBlur={hideBubble}
        ref={refContent}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { refFocus })
        )}
      </div>
    </div>
  );
}
