// components/editor/cards/urlDetectorExtension.ts

import { EditorView, ViewPlugin, ViewUpdate, DecorationSet, Decoration } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { cardRegistry } from './registry';

const addUrlMarker = StateEffect.define<{
  from: number;
  to: number;
  url: string;
}>();

const removeUrlMarker = StateEffect.define<number>();

const urlMarkersField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(markers, tr) {
    markers = markers.map(tr.changes);
    
    for (const effect of tr.effects) {
      if (effect.is(addUrlMarker)) {
        const { from, to, url } = effect.value;
        const marker = Decoration.mark({
          class: 'cm-url-marker',
          url
        }).range(from, to);
        markers = markers.update({ add: [marker] });
      }
      else if (effect.is(removeUrlMarker)) {
        const pos = effect.value;
        markers = markers.update({
          filter: (from) => from !== pos
        });
      }
    }
    
    return markers;
  },
  provide: f => EditorView.decorations.from(f)
});

export function urlDetectorExtension(onUrlFound: (url: string, pos: number) => void) {
  return [
    urlMarkersField,
    ViewPlugin.fromClass(class {
      private scheduledUpdate: number | null = null;
      urlPattern = /https?:\/\/[^\s]+/g;
      
      update(update: ViewUpdate) {
        if (!update.docChanged) return;

        const text = update.state.doc.toString();
        const matches = Array.from(text.matchAll(this.urlPattern));
        const updates: {from: number; to: number; url: string}[] = [];
        
        for (const match of matches) {
          const url = match[0];
          const from = match.index!;
          const to = from + url.length;
          
          const cardType = cardRegistry.getCardForUrl(url);
          if (cardType) {
            const existingMarkers = update.state.field(urlMarkersField);
            let hasMarker = false;
            
            existingMarkers.between(from, to, () => {
              hasMarker = true;
            });
            
            if (!hasMarker) {
              updates.push({ from, to, url });
            }
          }
        }

        // If we have updates, apply them all at once
        if (updates.length > 0) {
          const effects = updates.map(update => addUrlMarker.of(update));
          
          // Use requestAnimationFrame for visual updates if needed
          if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
              update.view.dispatch({ effects });
              // Notify about URLs after applying effects
              updates.forEach(({ url, from }) => onUrlFound(url, from));
            });
          } else {
            // Fallback for non-browser environments
            update.view.dispatch({ effects });
            updates.forEach(({ url, from }) => onUrlFound(url, from));
          }
        }
      }
    })
  ];
}