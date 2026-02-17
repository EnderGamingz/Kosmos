import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export function OnChangePlugin({
  onChange,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: The editorState type is complex and not easily inferred, so we use any here for simplicity.
  onChange: (editorState: any) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(
      // biome-ignore lint/suspicious/noExplicitAny: The editorState type is complex and not easily inferred, so we use any here for simplicity.
      ({ editorState }: { editorState: any }) => {
        onChange(editorState);
      },
    );
  }, [editor, onChange]);
  return null;
}
