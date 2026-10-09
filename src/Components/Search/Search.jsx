import { AsyncPaginate } from "react-select-async-paginate";
import { useState } from "react";
import { API_BASE_URL } from "../../API";

const Search = ({ onSearchChange }) => {
  const [search, setSearch] = useState(null);

  const loadOptions = (inputValue) => {
    if (!inputValue) {
      return Promise.resolve({ options: [] });
    }

    return fetch(`${API_BASE_URL}/cities?q=${encodeURIComponent(inputValue)}&limit=5`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || `City search failed (${response.status})`);
        }

        const cities = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(cities)) {
          throw new Error("City search returned an unexpected response format");
        }

        return {
          options: cities.map((city) => ({
            value: `${city.latitude} ${city.longitude}`,
            label: `${city.name}${city.region ? `, ${city.region}` : ""}, ${city.country}`,
          })),
        };
      })
      .catch((error) => {
        console.error("City search error:", error);
        return { options: [] };
      });
  };

  const handleOnChange = (searchData) => {
    setSearch(searchData);
    onSearchChange(searchData);
  };

  return (
    <AsyncPaginate
      placeholder="Search for city"
      debounceTimeout={600}
      value={search}
      onChange={handleOnChange}
      loadOptions={loadOptions}
    />
  );
};

export default Search;