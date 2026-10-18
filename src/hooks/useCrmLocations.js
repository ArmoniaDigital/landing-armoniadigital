import { useEffect, useMemo, useState } from "react";

const fallbackCountries = [
  ["Colombia", "+57"],
  ["Estados Unidos", "+1"],
  ["Mexico", "+52"],
  ["Espana", "+34"],
  ["Venezuela", "+58"],
  ["Argentina", "+54"],
  ["Chile", "+56"],
  ["Peru", "+51"],
  ["Otro", ""],
];

function getLocationsEndpoint() {
  const eventEndpoint = import.meta.env.VITE_CRM_WEBHOOK_URL || "";
  return eventEndpoint.replace(/\/landing\/events\/?$/, "/landing/locations");
}

function normalizeCountries(countries) {
  if (!Array.isArray(countries) || countries.length === 0) {
    return fallbackCountries.map(([name, phoneCode]) => ({ name, phoneCode, states: [] }));
  }

  return countries
    .filter((country) => country?.name)
    .map((country) => ({
      name: country.name,
      phoneCode: country.phone_code || country.phoneCode || "",
      states: Array.isArray(country.states) ? country.states : [],
    }));
}

export function useCrmLocations() {
  const [countries, setCountries] = useState(() => normalizeCountries([]));
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const endpoint = getLocationsEndpoint();

    if (!endpoint) {
      return;
    }

    const controller = new AbortController();

    setStatus("loading");

    fetch(endpoint, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Locations request failed with status ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setCountries(normalizeCountries(data?.countries));
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, []);

  return useMemo(() => ({ countries, status }), [countries, status]);
}

export function findCountry(countries, countryName) {
  return countries.find((country) => country.name === countryName);
}
