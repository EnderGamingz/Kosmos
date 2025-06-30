import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@lib/utils.ts';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Redo,
  Strikethrough,
  Text,
  Underline,
  Undo,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select.tsx';

const LowPriority = 1;

function Divider() {
  return <div className={'mx-2 w-[1px] bg-muted-foreground/50 my-1'} />;
}

export const formatHeading = (
  editor: LexicalEditor,
  headingSize: HeadingTagType,
) => {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createHeadingNode(headingSize));
  });
};

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [heading, setHeading] = useState<string>('paragraph');

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const type = $isHeadingNode(element)
        ? element.getTag()
        : element.getType();
      setHeading(type);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div
      className={cn(
        'w-full flex flex-wrap p-1 gap-0.5',
        '[&_.toolbar-item]:flex [&_.toolbar-item]:p-2 [&_.toolbar-item]:rounded-md [&_.toolbar-item]:hover:bg-muted',
        '[&_.toolbar-item]:text-stone-800 [&_.toolbar-item_svg]:h-5 [&_.toolbar-item_svg]:w-5',
        '[&_.toolbar-item.active]:bg-stone-200 dark:[&_.toolbar-item.active]:bg-stone-800',
      )}
      ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className='toolbar-item'
        aria-label='Undo'>
        <Undo />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className='toolbar-item'
        aria-label='Redo'>
        <Redo />
      </button>
      <Divider />
      <Select
        value={heading}
        onValueChange={v => {
          formatHeading(editor, v as HeadingTagType);
        }}>
        <SelectTrigger className={'h-9 min-w-36'} defaultValue={'paragraph'}>
          <SelectValue className={'p-1'} placeholder={'Text'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'paragraph'}>
            <Text />
            Paragraph
          </SelectItem>
          <SelectItem value={'h1'}>
            <Heading1 />
            Heading 1
          </SelectItem>
          <SelectItem value={'h2'}>
            <Heading2 />
            Heading 2
          </SelectItem>
          <SelectItem value={'h3'}>
            <Heading3 />
            Heading 3
          </SelectItem>
          <SelectItem value={'h4'}>
            <Heading4 />
            Heading 4
          </SelectItem>
          <SelectItem value={'h5'}>
            <Heading5 />
            Heading 5
          </SelectItem>
          <SelectItem value={'h6'}>
            <Heading6 />
            Heading 6
          </SelectItem>
        </SelectContent>
      </Select>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={`toolbar-item ${isBold ? 'active' : ''}`}
        aria-label='Format Bold'>
        <Bold />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={`toolbar-item ${isItalic ? 'active' : ''}`}
        aria-label='Format Italics'>
        <Italic />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={`toolbar-item ${isUnderline ? 'active' : ''}`}
        aria-label='Format Underline'>
        <Underline />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={`toolbar-item ${isStrikethrough ? 'active' : ''}`}
        aria-label='Format Strikethrough'>
        <Strikethrough />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        className={`toolbar-item ${isCode ? 'active' : ''}`}
        aria-label='Format Code'>
        <Code />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className='toolbar-item'
        aria-label='Left Align'>
        <AlignLeft />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className='toolbar-item'
        aria-label='Center Align'>
        <AlignCenter />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className='toolbar-item'
        aria-label='Right Align'>
        <AlignRight />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className='toolbar-item'
        aria-label='Justify Align'>
        <AlignJustify />
      </button>
    </div>
  );
}
