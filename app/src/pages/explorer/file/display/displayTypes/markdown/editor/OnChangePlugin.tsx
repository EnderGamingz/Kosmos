import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export function OnChangePlugin({
  onChange,
}: {
  onChange: (editorState: any) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }: { editorState: any }) => {
        onChange(editorState);
      },
    );
  }, [editor, onChange]);
  return null;
}
