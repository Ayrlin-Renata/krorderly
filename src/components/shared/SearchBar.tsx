import { forwardRef } from 'preact/compat';
import type { JSX } from 'preact';

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onInput, placeholder = "Search..." }, ref) => {
    const handleInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
      onInput(event.currentTarget.value);
    };
    const handleClick = (event: JSX.TargetedEvent<HTMLInputElement, MouseEvent>) => {
      event.currentTarget.select();
    };
    const clearSearch = () => {
      onInput('');
      // Focus the input after clearing
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    };
    return (
      <div class="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onInput={handleInput}
          onClick={handleClick}
          placeholder={placeholder}
          class="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        {value && (
          <button
            onClick={clearSearch}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
