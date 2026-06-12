import { AsyncPaginate } from "react-select-async-paginate";
import { useState } from "react";
import { WEATHER_API_KEY } from "../../API";

const Search = ({ onSearchChange }) => {
  const [search, setSearch] = useState(null);

  const loadOptions = (inputValue) => {
    if (!inputValue) {
      return Promise.resolve({ options: [] });
    }

    return fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${WEATHER_API_KEY}`
    )
      .then((response) => response.json())
      .then((cities) => {
        return {
          options: cities.map((city) => ({
            value: `${city.lat} ${city.lon}`,
            label: `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`,
          })),
        };
      })
      .catch((error) => {
        console.log("OpenWeather city search error:", error);
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