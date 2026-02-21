import {
  type InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import type { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '@lib/env.ts';
import { invalidateFiles, setFileContent } from '@lib/query.ts';
import { DialogFooter } from '@components/ui/dialog.tsx';
import ToolbarPlugin from '@pages/explorer/file/display/displayTypes/markdown/editor/ToolbarPlugin.tsx';
import { OnChangePlugin } from '@pages/explorer/file/display/displayTypes/markdown/editor/OnChangePlugin.tsx';
import { Button } from '@components/ui/button.tsx';
import { Check } from 'lucide-react';

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

const nodes = [
  CodeNode,
  CodeHighlightNode,
  HashtagNode,
  LinkNode,
  ListItemNode,
  ListNode,
  MarkNode,
  OverflowNode,
  HorizontalRuleNode,
  HeadingNode,
  QuoteNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  AutoLinkNode,
];

export const editorConfig: InitialConfigType = {
  namespace: 'Kosmos Editor',
  onError: console.error,
  nodes,
  theme: {
    paragraph: 'text-base',
    heading: {
      h1: 'text-5xl font-bold tracking-tight mb-6',
      h2: 'text-4xl font-bold tracking-tight mb-5',
      h3: 'text-3xl font-bold tracking-tight mb-4',
      h4: 'text-2xl font-semibold tracking-tight mb-3',
      h5: 'text-xl font-semibold tracking-tight mb-2',
      h6: 'text-lg font-medium tracking-tight mb-1',
    },
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
      code: 'font-mono',
      quote: 'italic',
      link: 'underline',
      linkActive: 'underline',
    },
  },
};

export function MarkdownEditorContent({
  file,
  initialData,
  onClose,
  isMarkdown,
}: {
  file: FileModelDTO;
  initialData: string;
  onClose: () => void;
  isMarkdown: boolean;
}) {
  const notifications = useNotifications(s => s.actions);
  const [code, setCode] = useState(initialData);

  const saveAction = useMutation({
    mutationFn: async () => {
      const updateId = notifications.notify({
        title: 'Updating file',
        status: `Updating...`,
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .post(`${BASE_URL}auth/file/${file.id}/content`, {
          content: code,
        })
        .then(() => {
          setFileContent(file.id, code);
          invalidateFiles().then();
          onClose();
          notifications.updateNotification(updateId, {
            severity: Severity.SUCCESS,
            status: 'Updated',
            timeout: 1000,
            canDismiss: true,
          });
        })
        .catch(() => {
          notifications.updateNotification(updateId, {
            severity: Severity.ERROR,
            status: 'Failed to update',
            timeout: 1000,
            canDismiss: true,
          });
        });
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        saveAction.mutate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveAction.mutate]);

  // biome-ignore lint/suspicious/noExplicitAny: Lexical editorState type is complex and not worth defining here
  const onChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS, undefined, true);
      setCode(markdown);
    });
  };

  const Editor = isMarkdown ? RichTextPlugin : PlainTextPlugin;

  return (
    <>
      <div className={'flex flex-col grow w-full rounded-sm outline-none'}>
        <LexicalComposer
          initialConfig={{
            editorState: () => {
              const root = $getRoot();
              root.clear();

              if (isMarkdown) {
                $convertFromMarkdownString(
                  initialData,
                  TRANSFORMERS,
                  undefined,
                  true,
                );
                return;
              }

              // Preserve line breaks for plain text by creating a new paragraph for each line
              const lines = initialData.split('\n');
              for (let i = 0; i < lines.length; i++) {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(lines[i]));
                root.append(paragraph);
              }
            },
            ...editorConfig,
          }}
        >
          {isMarkdown && <ToolbarPlugin />}
          <div
            className={
              'min-h-50 h-0 grow overflow-auto flex flex-col border rounded-sm'
            }
          >
            <Editor
              contentEditable={
                <ContentEditable
                  className={'grow outline-none p-2'}
                  aria-placeholder={'Enter some text...'}
                  // biome-ignore lint/complexity/noUselessFragments: empty placeholder to avoid default text
                  placeholder={<></>}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={onChange} />
        </LexicalComposer>
      </div>
      <DialogFooter>
        <Button
          disabled={saveAction.isPending}
          onClick={() => saveAction.mutate()}
        >
          <Check /> {saveAction.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  );
}
