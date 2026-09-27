import { useEffect, useId, useRef, useState } from "react";
import { Button } from "~/components/Button";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterProps {
  label: string;
  options: FilterOption[];
  selected?: string[];
  defaultSelected?: string[];
  onApply?: (selected: string[]) => void;
}

const Filter = ({ label, options, selected, defaultSelected = [], onApply }: FilterProps) => {
  const isControlled = selected !== undefined;
  const [appliedState, setAppliedState] = useState<string[]>(defaultSelected);
  const effectiveSelected = isControlled ? selected : appliedState;

  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [draft, setDraft] = useState<string[]>(effectiveSelected);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const openPanel = () => {
    setDraft(effectiveSelected);
    setShouldRender(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const closePanel = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldRender]);

  const toggleOption = (value: string) => {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleApply = () => {
    if (!isControlled) setAppliedState(draft);
    onApply?.(draft);
    closePanel();
    buttonRef.current?.focus();
  };

  const selectedLabels = options
    .filter((option) => effectiveSelected.includes(option.value))
    .map((option) => option.label);

  const isActive = selectedLabels.length > 0;

  const triggerLabel = isActive ? `${label}: ${selectedLabels.join(", ")}` : label;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? closePanel() : openPanel())}
        className={`inline-flex items-center gap-2 rounded-full border-2 border-text px-2 py-1 text-xs font-heading lowercase font-bold cursor-pointer transition-all duration-800 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current ${
          isActive ? "bg-text text-white hover:bg-text/90" : "hover:bg-text/10"
        }`}
      >
        {triggerLabel}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5L10 12.5L15 7.5" />
        </svg>
      </button>

      {shouldRender && (
        <div
          id={panelId}
          ref={panelRef}
          role="group"
          aria-label={`${label} filter options`}
          aria-hidden={!open}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && !open) {
              setShouldRender(false);
            }
          }}
          className={`absolute z-10 mt-2 w-56 origin-top rounded-md border-2 border-text bg-white p-4 shadow-lg transition-all duration-200 ease-out ${
            open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
          }`}
        >
          <ul className="flex flex-col gap-2">
            {options.map((option) => {
              const optionId = `${panelId}-${option.value}`;
              return (
                <li key={option.value}>
                  <label htmlFor={optionId} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id={optionId}
                      name={panelId}
                      value={option.value}
                      checked={draft.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                      className="h-4 w-4 cursor-pointer accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current"
                    />
                    {option.label}
                  </label>
                </li>
              );
            })}
          </ul>

          <Button variant="primary" onClick={handleApply} className="mt-4 w-full">
            Apply
          </Button>
        </div>
      )}
    </div>
  );
};

export default Filter;
