import React, {useEffect} from 'react';
import SearchBar from '@theme-original/SearchBar';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Enter opens the full results page, like "See all results". Arrow keys
// still pick one suggestion, and Enter then opens that one.
export default function SearchBarWrapper(props) {
  const history = useHistory();
  const searchUrl = useBaseUrl('/search');

  useEffect(() => {
    let picked = false;
    const isSearchInput = (el: EventTarget | null) =>
      el instanceof HTMLInputElement && el.classList.contains('navbar__search-input');

    function onKeyDown(e: KeyboardEvent) {
      if (!isSearchInput(e.target)) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        picked = true;
        return;
      }
      if (e.key !== 'Enter' || picked || e.isComposing) return;
      const input = e.target as HTMLInputElement;
      const query = input.value.trim();
      if (!query) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      input.blur();
      history.push(`${searchUrl}?q=${encodeURIComponent(query)}`);
    }
    function onInput(e: Event) {
      if (isSearchInput(e.target)) picked = false;
    }

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('input', onInput, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('input', onInput, true);
    };
  }, [history, searchUrl]);

  return <SearchBar {...props} />;
}
