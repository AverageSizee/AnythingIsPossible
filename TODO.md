# TODO: Add Search Functionality to Header with Animation and Navigation

- [ ] Modify AIP-app/src/Component/Header.tsx:
  - [ ] Add React state: `isSearchOpen` (boolean for input visibility), `searchValue` (string for input).
  - [ ] Implement a simple debounce function for navigation to avoid excessive calls.
  - [ ] On Search icon click: Toggle `isSearchOpen`, and if opening, focus the input.
  - [ ] Add an input element next to the Search icon with Tailwind classes for animation: `transition-all duration-300 w-0` when closed, `w-64` when open, positioned to the left of the icon.
  - [ ] On input change: Update `searchValue`, debounce navigation to `/products?search=${encodeURIComponent(searchValue)}` if searchValue is not empty, else to `/products`.

- [ ] Modify AIP-app/src/Pages/ProductsList.tsx:
  - [ ] Import `useSearchParams` from 'react-router-dom'.
  - [ ] Use `useSearchParams` to get and set URL params.
  - [ ] Add useEffect to initialize `searchQuery` from `searchParams.get('search')` on mount.
  - [ ] Add useEffect to update URL params when `searchQuery` changes (set `searchParams({ search: searchQuery })` if searchQuery is not empty, else remove 'search' param).
  - [ ] Ensure no infinite loops by checking if the param differs before setting.

- [ ] Followup steps:
  - [ ] Run the app locally to test the animation (input expands smoothly to the left of the icon).
  - [ ] Test navigation: Typing in header input navigates to /products with query, and ProductsList reflects the search.
  - [ ] Verify URL sync: Changing search in ProductsList updates URL, and reloading page preserves search.
