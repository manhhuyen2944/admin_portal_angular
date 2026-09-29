import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import type { IconName } from '../icon/icon-registry';
import { CheckboxComponent } from '../checkbox/checkbox';
import { BadgeComponent, type BadgeVariant } from '../badge/badge';

export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  icon?: IconName;
  expandedIcon?: IconName;
  expanded?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  children?: TreeNode<T>[];
  data?: T;
}

/**
 * TreeViewComponent — Hierarchical tree navigation with recursive expandable nodes and cascading checkbox selection.
 *
 * Features:
 *   - Expand / Collapse with smooth chevron indicator
 *   - Multi-select Checkbox with full 3-state cascading logic (checked, unchecked, indeterminate)
 *   - Automatic parent-child synchronization
 *   - Search / Filter capability
 *   - Custom icon and status badge per node
 *   - Expand All / Collapse All & Check All / Uncheck All controls
 *
 * Usage:
 *   <app-tree-view
 *     [nodes]="treeData"
 *     [checkable]="true"
 *     [cascadeCheck]="true"
 *     (selectionChange)="onSelectionChange($event)"
 *     (nodeClick)="onNodeClick($event)"
 *   />
 */
@Component({
  selector: 'app-tree-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, CheckboxComponent, BadgeComponent],
  template: `
    <div class="flex flex-col gap-2.5 w-full">
      <!-- Optional Search Filter -->
      @if (searchable()) {
        <div class="relative w-full">
          <div class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <app-icon name="search" size="xs" />
          </div>
          <input
            type="text"
            [placeholder]="searchPlaceholder()"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            class="w-full rounded-xl border border-border bg-surface pl-8 pr-3 py-1.5 text-base lg:text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-colors"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs cursor-pointer p-0.5"
            >
              <app-icon name="x" size="xs" />
            </button>
          }
        </div>
      }

      <!-- Tree Container -->
      <div
        role="tree"
        class="w-full rounded-xl border border-border bg-surface p-2.5 space-y-0.5 text-sm select-none"
      >
        @if (filteredNodes().length === 0) {
          <div class="py-6 text-center text-xs text-muted flex flex-col items-center gap-1.5">
            <app-icon name="folder" size="md" class="opacity-40" />
            <span>{{ emptyMessage() }}</span>
          </div>
        } @else {
          @for (node of filteredNodes(); track node.id) {
            <ng-container
              *ngTemplateOutlet="nodeTemplate; context: { node: node, level: 0 }"
            />
          }
        }
      </div>
    </div>

    <!-- Recursive Node Template -->
    <ng-template #nodeTemplate let-node="node" let-level="level">
      <div
        role="treeitem"
        [attr.aria-expanded]="hasChildren(node) ? !!node.expanded : null"
        [attr.aria-checked]="checkable() ? (node.checked ? 'true' : (node.indeterminate ? 'mixed' : 'false')) : null"
        class="group/item flex flex-col"
      >
        <!-- Node Row -->
        <div
          class="flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors cursor-pointer hover:bg-surface-raised"
          [class.bg-primary-light/10]="selectedNodeId() === node.id"
          [style.padding-left.rem]="0.5 + level * 1.25"
          (click)="handleNodeClick(node, $event)"
        >
          <!-- Expand/Collapse Chevron -->
          @if (hasChildren(node)) {
            <button
              type="button"
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted hover:text-foreground hover:bg-border/40 transition-transform cursor-pointer"
              [class.rotate-90]="node.expanded"
              (click)="toggleExpand(node, $event)"
              aria-label="Toggle node expand"
            >
              <app-icon name="chevron-right" size="xs" />
            </button>
          } @else {
            <span class="w-5 shrink-0"></span>
          }

          <!-- Checkbox -->
          @if (checkable()) {
            <div class="shrink-0" (click)="$event.stopPropagation()">
              <app-checkbox
                [checked]="!!node.checked"
                [indeterminate]="!!node.indeterminate"
                [disabled]="!!node.disabled"
                size="sm"
                (checkedChange)="handleCheckChange(node, $event)"
              />
            </div>
          }

          <!-- Node Icon -->
          @if (showIcons()) {
            <app-icon
              [name]="getNodeIcon(node)"
              size="xs"
              class="shrink-0 transition-colors"
              [class.text-primary]="hasChildren(node)"
              [class.text-muted]="!hasChildren(node)"
            />
          }

          <!-- Node Label -->
          <span
            class="flex-1 truncate text-xs font-medium transition-colors"
            [class.text-foreground]="!node.disabled"
            [class.text-muted]="node.disabled"
            [class.font-semibold]="hasChildren(node)"
          >
            {{ node.label }}
          </span>

          <!-- Badge -->
          @if (showBadges() && node.badge !== undefined) {
            <app-badge
              [variant]="node.badgeVariant ?? 'default'"
              size="sm"
              class="shrink-0"
            >
              {{ node.badge }}
            </app-badge>
          }
        </div>

        <!-- Children Container (Recursive) -->
        @if (hasChildren(node) && (node.expanded || isSearching())) {
          <div class="flex flex-col space-y-0.5 border-l border-border/40 ml-4 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
            @for (child of node.children; track child.id) {
              <ng-container
                *ngTemplateOutlet="nodeTemplate; context: { node: child, level: level + 1 }"
              />
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class TreeViewComponent<T = unknown> {
  /** Array of hierarchical tree nodes */
  nodes = input.required<TreeNode<T>[]>();

  /** Enable multi-select checkboxes on nodes */
  checkable = input(true);

  /** Whether checking a parent cascades down to all children and updates upward */
  cascadeCheck = input(true);

  /** Display folder / file icons next to labels */
  showIcons = input(true);

  /** Display badge counters on nodes */
  showBadges = input(true);

  /** Enable search input box above the tree */
  searchable = input(false);
  searchPlaceholder = input('Search tree nodes...');
  emptyMessage = input('No matching items found');

  /** Active selected node ID */
  selectedNodeId = model<string | null>(null);

  /** Emitted when node check status changes (returns list of checked IDs) */
  selectionChange = output<string[]>();

  /** Emitted when node check status changes (returns full list of checked nodes) */
  checkedNodesChange = output<TreeNode<T>[]>();

  /** Emitted when a node row is clicked */
  nodeClick = output<TreeNode<T>>();

  /** Emitted when a node is expanded */
  nodeExpand = output<TreeNode<T>>();

  /** Emitted when a node is collapsed */
  nodeCollapse = output<TreeNode<T>>();

  protected readonly searchQuery = signal('');

  protected readonly isSearching = computed(() => this.searchQuery().trim().length > 0);

  protected readonly filteredNodes = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.nodes();
    return this.filterTree(this.nodes(), q);
  });

  private filterTree(nodes: TreeNode<T>[], query: string): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];
    for (const node of nodes) {
      const matchSelf = node.label.toLowerCase().includes(query);
      const filteredChildren = node.children ? this.filterTree(node.children, query) : [];
      if (matchSelf || filteredChildren.length > 0) {
        result.push({
          ...node,
          expanded: true,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        });
      }
    }
    return result;
  }

  protected hasChildren(node: TreeNode<T>): boolean {
    return Array.isArray(node.children) && node.children.length > 0;
  }

  protected getNodeIcon(node: TreeNode<T>): IconName {
    if (this.hasChildren(node)) {
      if (node.expanded) {
        return node.expandedIcon ?? 'folder-open';
      }
      return node.icon ?? 'folder';
    }
    return node.icon ?? 'file-text';
  }

  protected toggleExpand(node: TreeNode<T>, event: MouseEvent): void {
    event.stopPropagation();
    node.expanded = !node.expanded;
    if (node.expanded) {
      this.nodeExpand.emit(node);
    } else {
      this.nodeCollapse.emit(node);
    }
  }

  protected handleNodeClick(node: TreeNode<T>, event: MouseEvent): void {
    if (node.disabled) return;
    this.selectedNodeId.set(node.id);
    this.nodeClick.emit(node);

    // If node has children and row clicked, toggle expansion
    if (this.hasChildren(node)) {
      this.toggleExpand(node, event);
    }
  }

  protected handleCheckChange(node: TreeNode<T>, checked: boolean): void {
    if (node.disabled) return;
    node.checked = checked;
    node.indeterminate = false;

    if (this.cascadeCheck()) {
      // 1. Cascade downwards to all children
      if (node.children) {
        this.setChildrenCheck(node.children, checked);
      }

      // 2. Cascade upwards to recompute parents
      this.recomputeTreeState(this.nodes());
    }

    this.emitSelectionUpdates();
  }

  private setChildrenCheck(children: TreeNode<T>[], checked: boolean): void {
    for (const child of children) {
      if (!child.disabled) {
        child.checked = checked;
        child.indeterminate = false;
        if (child.children) {
          this.setChildrenCheck(child.children, checked);
        }
      }
    }
  }

  private recomputeTreeState(nodes: TreeNode<T>[]): { allChecked: boolean; anyChecked: boolean } {
    let allNodesChecked = true;
    let anyNodeChecked = false;

    for (const node of nodes) {
      if (this.hasChildren(node)) {
        const childState = this.recomputeTreeState(node.children!);
        if (childState.allChecked) {
          node.checked = true;
          node.indeterminate = false;
          anyNodeChecked = true;
        } else if (childState.anyChecked) {
          node.checked = false;
          node.indeterminate = true;
          allNodesChecked = false;
          anyNodeChecked = true;
        } else {
          node.checked = false;
          node.indeterminate = false;
          allNodesChecked = false;
        }
      } else {
        if (node.checked) {
          anyNodeChecked = true;
        } else {
          allNodesChecked = false;
        }
      }
    }

    return { allChecked: allNodesChecked, anyChecked: anyNodeChecked };
  }

  private emitSelectionUpdates(): void {
    const checkedNodes: TreeNode<T>[] = [];
    const checkedIds: string[] = [];

    const collect = (list: TreeNode<T>[]) => {
      for (const n of list) {
        if (n.checked) {
          checkedNodes.push(n);
          checkedIds.push(n.id);
        }
        if (n.children) {
          collect(n.children);
        }
      }
    };

    collect(this.nodes());
    this.checkedNodesChange.emit(checkedNodes);
    this.selectionChange.emit(checkedIds);
  }

  protected onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  /** Expand all nodes in the tree */
  expandAll(): void {
    const setExpand = (list: TreeNode<T>[]) => {
      for (const n of list) {
        if (this.hasChildren(n)) {
          n.expanded = true;
          setExpand(n.children!);
        }
      }
    };
    setExpand(this.nodes());
  }

  /** Collapse all nodes in the tree */
  collapseAll(): void {
    const setCollapse = (list: TreeNode<T>[]) => {
      for (const n of list) {
        if (this.hasChildren(n)) {
          n.expanded = false;
          setCollapse(n.children!);
        }
      }
    };
    setCollapse(this.nodes());
  }

  /** Check all nodes in the tree */
  checkAll(): void {
    const checkNodes = (list: TreeNode<T>[]) => {
      for (const n of list) {
        if (!n.disabled) {
          n.checked = true;
          n.indeterminate = false;
          if (n.children) checkNodes(n.children);
        }
      }
    };
    checkNodes(this.nodes());
    this.emitSelectionUpdates();
  }

  /** Uncheck all nodes in the tree */
  uncheckAll(): void {
    const uncheckNodes = (list: TreeNode<T>[]) => {
      for (const n of list) {
        n.checked = false;
        n.indeterminate = false;
        if (n.children) uncheckNodes(n.children);
      }
    };
    uncheckNodes(this.nodes());
    this.emitSelectionUpdates();
  }
}
