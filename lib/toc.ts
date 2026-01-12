// TODO: Fix this when we turn strict mode on.
import { toc } from 'mdast-util-toc';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Parent, Node } from 'unist';
import type { Root } from 'mdast';

const textTypes = ['text', 'emphasis', 'strong', 'inlineCode'];

interface FlatNode extends Node {
  value?: string;
  type: string;
}

interface LinkNode extends Node {
  type: 'link';
  url: string;
}

function flattenNode(node: Node): string {
  const p: string[] = [];
  visit(node, (childNode: FlatNode) => {
    if (!textTypes.includes(childNode.type)) return;
    if (childNode.value) {
      p.push(childNode.value);
    }
  });
  return p.join(``);
}

interface Item {
  title: string;
  url: string;
  items?: Array<Item>;
}

interface Items {
  items?: Array<Item>;
}

interface ListNode extends Node {
  type: 'list';
  children: Node[];
}

interface ParagraphNode extends Node {
  type: 'paragraph';
}

function getItems(node: Node | undefined, current: Item): Item {
  if (!node) {
    return {} as Item;
  }

  if (node.type === 'paragraph') {
    visit(node, (item: FlatNode | LinkNode) => {
      if (item.type === 'link') {
        current.url = (item as LinkNode).url;
        current.title = flattenNode(node);
      }

      if (item.type === 'text') {
        current.title = flattenNode(node);
      }
    });

    return current;
  }

  if (node.type === 'list') {
    const listNode = node as ListNode;
    current.items = listNode.children.map((i) => getItems(i, {} as Item));

    return current;
  } else if (node.type === 'listItem') {
    const parent = node as Parent;
    const heading = getItems(parent.children[0], {} as Item);

    if (parent.children.length > 1) {
      getItems(parent.children[1], heading);
    }

    return heading;
  }

  return {} as Item;
}

const getToc = () => (node: Root, file: { data: unknown }) => {
  const table = toc(node);
  file.data = getItems(table.map, {} as Item);
};

export type TableOfContents = Items;

export async function getTableOfContents(
  content: string
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content);

  return result.data as TableOfContents;
}
