'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import styles from '../app/page.module.css';

export type ProjectTab = {
  id: string;
  label: string;
  panel: ReactNode;
};

type Props = {
  tabs: ProjectTab[];
  /** Fallback when hash is missing or unknown */
  defaultTab?: string;
};

function hashToTabId(hash: string, tabIds: string[]): string | null {
  const raw = hash.replace(/^#/, '').trim().toLowerCase();
  if (!raw) return null;
  return tabIds.includes(raw) ? raw : null;
}

export function ProjectTabs({ tabs, defaultTab }: Props) {
  const baseId = useId();
  const tabIds = tabs.map((t) => t.id);
  const fallback =
    defaultTab && tabIds.includes(defaultTab) ? defaultTab : (tabIds[0] ?? 'overview');

  const [activeId, setActiveId] = useState(fallback);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabIdsKey = tabIds.join('|');

  const selectTab = useCallback(
    (id: string, syncHash: boolean) => {
      if (!tabIds.includes(id)) return;
      setActiveId(id);
      if (syncHash && typeof window !== 'undefined') {
        const next = `#${id}`;
        if (window.location.hash !== next) {
          window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${window.location.search}${next}`
          );
        }
      }
    },
    [tabIds]
  );

  useEffect(() => {
    const applyHash = () => {
      const fromHash = hashToTabId(window.location.hash, tabIds);
      if (fromHash) setActiveId(fromHash);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [tabIdsKey, tabIds]);

  // Keep selection valid if tabs change (e.g. peer tab appears after load)
  useEffect(() => {
    if (!tabIds.includes(activeId)) {
      setActiveId(fallback);
    }
  }, [tabIdsKey, activeId, fallback, tabIds]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabIds.indexOf(activeId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = tabIds.length - 1;
    } else {
      return;
    }

    const nextId = tabIds[nextIndex];
    selectTab(nextId, true);
    tabRefs.current[nextIndex]?.focus();
  };

  if (tabs.length === 0) return null;

  return (
    <div className={styles.projectTabs}>
      <div
        className={styles.projectTabList}
        role="tablist"
        aria-label="Project sections"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? styles.projectTabActive : styles.projectTab}
              onClick={() => selectTab(tab.id, true)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        const panelId = `${baseId}-panel-${tab.id}`;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={!selected}
            className={styles.projectTabPanel}
          >
            {/* Stable hash target for deep links (e.g. #peer-ratings) */}
            {tab.id === 'peer-ratings' ? <span id="peer-ratings" /> : null}
            {selected ? tab.panel : null}
          </div>
        );
      })}
    </div>
  );
}
