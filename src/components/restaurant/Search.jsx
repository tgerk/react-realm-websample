import React, { useState } from "react";
import { useLocation } from "react-router";

import crc32 from "crc-32";

import Bubble from "Bubble";

import { useRealm, useDebouncedEffect } from "services/realm";
import { useCuisines } from "services/graphql/restaurants";

const ALL_CUISINES = "All Cuisines";

export default function SearchRestaurants() {
  const [cuisines] = useCuisines(),
    [{ restaurants: { query: lastQuery = {} } = {} }, api] = useRealm(),
    { search } = useLocation(), // can be updated by Gallery pagination links
    locationQuery = Object.fromEntries(new URLSearchParams(search).entries()),
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
  useDebouncedEffect(() => api.getRestaurants(currentPage, query), 700, [
    query,
    api,
  ]);

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
          {cuisines.map((cuisine) => (
            <option
              value={cuisine}
              key={crc32.str(cuisine)}
              children={cuisine}
            />
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
