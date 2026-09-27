import { useSearchParams } from "react-router";
import AutocompleteSearch from "~/components/AutocompleteSearch";
import Card from "~/components/Card";
import Filter from "~/components/Filter";
import { matchesFilters, matchesSearch, type SelectedFilters } from "~/lib/fungiFilters";
import fungi from "~/mock-api/fungi.json";
import filters from "~/mock-api/filters.json";

interface BrowseAllProps {
  query: string;
  selected: SelectedFilters;
}

const BrowseAll = ({ query, selected }: BrowseAllProps) => {
  const results = fungi.filter(
    (fungus) => matchesSearch(fungus, query) && matchesFilters(fungus, selected),
  );

  if (results.length === 0) {
    return (
      <p className="p-4 text-center text-text/60">
        No fungi match your search/filters. Try broadening them.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((fungus) => (
        <Card
          key={fungus.id}
          imageUrl={fungus.media.profileImage?.url}
          imageAlt={fungus.commonName}
          name={fungus.commonName}
          scientificName={fungus.taxonomy.species}
          href={
            "/browse/" +
            [
              fungus.taxonomy.division,
              fungus.taxonomy.class,
              fungus.taxonomy.order,
              fungus.taxonomy.family,
              fungus.taxonomy.genus,
              fungus.taxonomy.species,
            ]
              .map(encodeURIComponent)
              .join("/")
          }
        />
      ))}
    </div>
  );
};

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getSelected = (param: string) =>
    searchParams.get(param)?.split(",").filter(Boolean) ?? [];

  const handleApply = (param: string) => (selected: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (selected.length > 0) {
        next.set(param, selected.join(","));
      } else {
        next.delete(param);
      }
      return next;
    });
  };

  const query = searchParams.get("q") ?? "";
  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      return next;
    });
  };

  const selected: SelectedFilters = Object.fromEntries(
    filters.map((filter) => [filter.param, getSelected(filter.param)]),
  );

  return (
    <section id="browse" className="w-full max-w-6xl mx-auto h-full">
      <div id="search-and-filters" className="flex flex-col gap-4">
        <AutocompleteSearch value={query} onChange={handleSearchChange} />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Filter
              key={filter.id}
              label={filter.label}
              options={filter.options}
              selected={getSelected(filter.param)}
              onApply={handleApply(filter.param)}
            />
          ))}
        </div>
      </div>
      <div id="results" className="flex flex-col mt-8">
        <div id="browse-options" className="flex flex-wrap gap-4">
          <button className="text-sm lowercase font-heading font-semibold bg-white rounded-t-md px-4 py-2 transition-all duration-800 ease-in-out">browse all</button>
          <button className="text-sm lowercase font-heading font-semibold bg-accent-rust/40 rounded-t-md px-4 py-2 transition-all duration-800 ease-in-out">browse by taxonomy</button>
        </div>
        <div id="results-list" className="flex flex-col gap-4 bg-white p-4 rounded-b-md rounded-tr-md">
          <BrowseAll query={query} selected={selected} />
        </div>
      </div>
    </section>
  );
}
