import React, { useState } from "react";

import Bubble from "Bubble";

import { useRealm, useDebouncedEffect } from "services/realm";
import { useCuisines } from "services/graphql";

const ALL_CUISINES = "All Cuisines";

export default function SearchRestaurants({ locationQuery }) {
  // note: search parameters in props are used as initial condition; updates to this form do not directly
  //  update the location (where the props come from):  user must do page navigation to change props
  const cuisines = useCuisines(),
    [{ restaurants: { query: lastQuery = {} } = {} }, api] = useRealm(),
    { page, skip, size, limit, ...currentQuery } = {
      ...locationQuery,
      ...lastQuery,
    },
    [query, setQuery] = useState(currentQuery),
    currentPage = (() => {
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

  const updateQuery = ({ target: { name, value } }) => {
    if (value === "" || (name === "cuisine" && value === ALL_CUISINES)) {
      const { [name]: _, ...rest } = query;
      setQuery(rest);
    } else {
      setQuery({ ...query, [name]: value });
    }
  };

  // debouncing provides automatic and periodic updates as search changes
  useDebouncedEffect(
    () => {
      const q = api.getRestaurants(currentPage, query);

      return q.cancel;
    },
    700,
    [locationQuery, query, api]
  );

  function SearchForm({ refFocus }) {
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

  return (
    <Bubble affordance={<button> Search </button>}>
      <SearchForm />
    </Bubble>
  );
}
