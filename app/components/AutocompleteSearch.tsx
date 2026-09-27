export interface AutocompleteSearchProps {
  value?: string;
  onChange?: (value: string) => void;
}

const AutocompleteSearch = ({ value = "", onChange }: AutocompleteSearchProps) => {
  return (
    <div className="w-full">
      <label htmlFor="search-for-fungi" className="hidden">search for fungi</label>
      <input
        type="text"
        id="search-for-fungi"
        name="search-for-fungi"
        placeholder="search for fungi..."
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full p-2 rounded-md border-2 border-text focus:outline-none focus:ring-2 focus:ring-text/20 text-xl w-full bg-white"
      />
    </div>
  );
};

export default AutocompleteSearch;
