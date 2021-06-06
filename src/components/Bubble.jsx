import React, { useRef } from "react";

export default function Bubble({ affordance, children, ...props }) {
  const refAffordance = useRef(),
    refBubble = useRef(),
    refFocus = useRef();

  // do I need a pure JS function to avoid re-renders on loss of focus?
  // TL;DR of https://www.eventbrite.com/engineering/a-story-of-a-react-re-rendering-bug/
  //  the onBlur handler should not cause a re-render
  function showBubble() {
    if (refAffordance.current) {
      refAffordance.current.style.visibility = "hidden";
    }
    if (refBubble.current) {
      refBubble.current.style.visibility = "visible";
    }
    refFocus.current?.focus();
  }

  function hideBubble({ currentTarget: us, relatedTarget: them }) {
    console.log({ us, them });
    if (!them || !us.contains(them)) {
      console.log({ refAffordance, refBubble });
      if (refAffordance.current) {
        refAffordance.current.style.visibility = "visible";
      }
      if (refBubble.current) {
        refBubble.current.style.visibility = "hidden";
      }
    }
  }

  return (
    <div className="bubble-root">
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
