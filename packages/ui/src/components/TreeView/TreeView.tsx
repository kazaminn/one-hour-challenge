'use client';

// Ark needs a tree collection (functions inside), which a Server
// Component could not pass down; so the wrapper builds it from plain
// nested nodes and renders the whole tree.
import type { ReactNode } from 'react';
import { TreeView as ArkTreeView, createTreeCollection } from '@ark-ui/react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark sets `--depth` on every node, so the indent is one padding rule.
const treeViewStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    tree: 'flex flex-col text-dense-14 base-fg',
    branch: '',
    branchControl: [
      'flex cursor-default items-center gap-1.5 rounded-control py-1 ps-[calc(var(--depth)*1.25rem+0.25rem)] pe-2 transition-colors',
      'hover:base-bg-subtle',
      'ark-selected:base-bg-muted ark-selected:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
      'focus-visible:-outline-offset-2',
    ],
    branchIndicator: [
      'inline-flex shrink-0 base-fg-muted transition-transform duration-transition ease-standard [&>svg]:size-4',
      'ark-open:rotate-90',
    ],
    branchText:
      'flex min-w-0 flex-1 items-center gap-1.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:base-fg-muted',
    branchContent: 'relative',
    branchIndentGuide:
      'absolute top-0 bottom-0 ms-[calc(var(--depth)*1.25rem+0.75rem)] border-s base-border-muted',
    item: [
      'flex cursor-default items-center gap-1.5 rounded-control py-1 ps-[calc(var(--depth)*1.25rem+1.75rem)] pe-2 transition-colors',
      'hover:base-bg-subtle',
      'ark-selected:base-bg-muted ark-selected:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
      'focus-visible:-outline-offset-2',
    ],
    itemText:
      'flex min-w-0 flex-1 items-center gap-1.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:base-fg-muted',
  },
});

const styles = treeViewStyles();

export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

type TreeViewProps = Omit<
  ArkTreeView.RootProps<TreeNode>,
  'collection' | 'children'
> & {
  nodes: TreeNode[];
  label?: ReactNode;
  indentGuide?: boolean;
};

const Node = ({
  node,
  indexPath,
  indentGuide,
}: ArkTreeView.NodeProviderProps<TreeNode> & { indentGuide: boolean }) => (
  <ArkTreeView.NodeProvider node={node} indexPath={indexPath}>
    {node.children ? (
      <ArkTreeView.Branch className={styles.branch()}>
        <ArkTreeView.BranchControl className={styles.branchControl()}>
          <ArkTreeView.BranchIndicator className={styles.branchIndicator()}>
            <ChevronRight aria-hidden="true" />
          </ArkTreeView.BranchIndicator>
          <ArkTreeView.BranchText className={styles.branchText()}>
            <ArkTreeView.NodeContext>
              {(state) =>
                state.expanded ? (
                  <FolderOpen aria-hidden="true" />
                ) : (
                  <Folder aria-hidden="true" />
                )
              }
            </ArkTreeView.NodeContext>
            {node.name}
          </ArkTreeView.BranchText>
        </ArkTreeView.BranchControl>
        <ArkTreeView.BranchContent className={styles.branchContent()}>
          {indentGuide && (
            <ArkTreeView.BranchIndentGuide
              className={styles.branchIndentGuide()}
            />
          )}
          {node.children.map((child, index) => (
            <Node
              key={child.id}
              node={child}
              indexPath={[...indexPath, index]}
              indentGuide={indentGuide}
            />
          ))}
        </ArkTreeView.BranchContent>
      </ArkTreeView.Branch>
    ) : (
      <ArkTreeView.Item className={styles.item()}>
        <ArkTreeView.ItemText className={styles.itemText()}>
          <File aria-hidden="true" />
          {node.name}
        </ArkTreeView.ItemText>
      </ArkTreeView.Item>
    )}
  </ArkTreeView.NodeProvider>
);

export const TreeView = ({
  nodes,
  label,
  indentGuide = false,
  className,
  translations,
  ...props
}: TreeViewProps) => {
  const collection = createTreeCollection<TreeNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: { id: 'ROOT', name: '', children: nodes },
  });

  return (
    <ArkTreeView.Root
      collection={collection}
      translations={{ treeLabel: 'ツリー', ...translations }}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkTreeView.Label className={styles.label()}>
          {label}
        </ArkTreeView.Label>
      )}
      <ArkTreeView.Tree className={styles.tree()}>
        {nodes.map((node, index) => (
          <Node
            key={node.id}
            node={node}
            indexPath={[index]}
            indentGuide={indentGuide}
          />
        ))}
      </ArkTreeView.Tree>
    </ArkTreeView.Root>
  );
};
