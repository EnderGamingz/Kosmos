import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { FileModelDTO } from '@bindings/FileModelDTO.ts';
import { Severity, useNotifications } from '@stores/notificationStore.ts';
import { useState } from 'react';
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
        title: 'Update file',
        severity: Severity.INFO,
        loading: true,
        canDismiss: false,
      });
      await axios
        .post(`${BASE_URL}auth/file/${file.id}/content`, {
          content: code,
        })
        .then(() => {
          onClose();
          setFileContent(file.id, code);
          invalidateFiles().then();
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

  const onChange = (editorState: any) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      setCode(markdown);
    });
  };

  return (
    <>
      <div className={'flex flex-col grow w-full rounded-sm outline-none'}>
        <div
          className={
            'h-full overflow-y-auto [&>div[role="textbox"]]:h-[calc(100%-44px)]'
          }>
          <LexicalComposer
            initialConfig={{
              editorState: () =>
                $convertFromMarkdownString(initialData, TRANSFORMERS),
              ...editorConfig,
            }}>
            {isMarkdown ? (
              <>
                <ToolbarPlugin />
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className={'p-2 border outline-none rounded-md'}
                      aria-placeholder={'Enter some text...'}
                      placeholder={<></>}
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </>
            ) : (
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable
                    className={'p-2 border outline-none rounded-md'}
                    aria-placeholder={'Enter some text...'}
                    placeholder={<></>}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            )}
            <HistoryPlugin />
            <AutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
          </LexicalComposer>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => saveAction.mutate()}>
          <Check /> Save
        </Button>
      </DialogFooter>
    </>
  );
}
