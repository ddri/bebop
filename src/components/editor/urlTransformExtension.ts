// components/editor/urlTransformExtension.ts
import { Extension } from '@codemirror/state';
import { ViewPlugin, ViewUpdate } from '@codemirror/view';
import { detectRichMedia } from './RichMediaTransformer';

export function urlTransformExtension(): Extension {
  return ViewPlugin.fromClass(class {
    update(update: ViewUpdate) {
      if (update.docChanged) {
        const changes = update.changes;
        const transformations: {from: number, to: number, insert: string}[] = [];
        
        changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
          const insertedText = inserted.toString();
          
          // Check if the inserted text might be a URL
          if (insertedText.match(/^https?:\/\/[^\s]+$/)) {
            // Get the context around the insertion point
            const doc = update.state.doc.toString();
            const beforeInsertion = doc.slice(Math.max(0, fromB - 2), fromB);
            const afterInsertion = doc.slice(toB, Math.min(doc.length, toB + 1));
            
            // Check if we're inside a Markdown link
            const isInLink = beforeInsertion.endsWith('](') || afterInsertion.startsWith(')');
            
            // Only transform if we're not in a link
            if (!isInLink) {
              const richMedia = detectRichMedia(insertedText);
              if (richMedia) {
                const embedText = `::${richMedia.type}[${JSON.stringify(richMedia.data)}]`;
                transformations.push({
                  from: fromB,
                  to: toB,
                  insert: embedText
                });
              }
            }
          }
        });

        // Apply all transformations in a single transaction after the update
        if (transformations.length > 0) {
          setTimeout(() => {
            update.view.dispatch({
              changes: transformations
            });
          }, 0);
        }
      }
    }
  });
}