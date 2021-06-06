import React, { useState, useEffect } from "react";

import { useRealm, useDebouncedEffect } from "services/realm";

const ALL_CUISINES = "All Cuisines";

export default function RestaurantsSearch({
  query: { page, skip, size, limit, ...queryProps },
  refFocus,
}) {
  // note: search parameters in props are used as initial condition; updates to this form do not directly
  //  update the location (where the props come from):  user must do page navigation to change props
  const [{ cuisines = [] }, api] = useRealm(),
    [query, setQuery] = useState(queryProps);

  page = (() => {
    const pagination = {};
    if (page) {
      pagination.page = page;
      if (size) {
        pagination.size = size;
      }
    } else if (skip) {
      pagination.skip = skip;
      if (limit) {
        pagination.limit = limit;
      }
    }

    return pagination;
  })();

  useEffect(() => {
    const q = api.getCuisines();
    q.catch((e) => {
      console.log(e);
    });
    return q.cancel;
  }, [api]);

  const updateQuery = ({ target: { name, value } }) => {
    if (value === "" || (name === "cuisine" && value === ALL_CUISINES)) {
      const { [name]: _, ...rest } = query;
      setQuery(rest);
    } else {
      setQuery({ ...query, [name]: value });
    }
  };

  // debouncing provides automatic and periodic updates as search parameters change
  // effect of searching propagates through the useRealm reducer
  // the very first call is not delayed
  useDebouncedEffect(
    () => {
      const q = api.getRestaurants(page, query);
      q.catch((e) => {
        console.log(e);
      });
      return q.cancel;
    },
    700,
    [query, api]
  );

  return (
    <div className="restaurants-search">
      <input
        type="text"
        name="text"
        value={query.text}
        onChange={updateQuery}
        placeholder="Text search (name or street)"
        ref={refFocus}
      />
      <input
        type="text"
        name="zipcode"
        value={query.zipcode}
        onChange={updateQuery}
        placeholder="Search by zip"
      />
      <select name="cuisine" onChange={updateQuery}>
        <option value={ALL_CUISINES}> {ALL_CUISINES} </option>
        {cuisines.map((cuisine, i) => (
          <option value={cuisine} key={i}>
            {" "}
            {cuisine}{" "}
          </option>
        ))}
      </select>
    </div>
  );
}
