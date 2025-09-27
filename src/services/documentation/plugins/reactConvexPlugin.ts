/**
 * Plugin per documentazione React + Convex
 * Fornisce documentazione tecnica specifica per questo stack
 */

import type { TechDocPlugin, TechDocSection, TechDocTemplate, TechDocContext } from '../models/techDocumentation';

export class ReactConvexPlugin implements TechDocPlugin {
  name = 'react-convex';
  version = '1.0.0';
  supportedFrameworks = ['React'];
  supportedBackends = ['Convex'];

  async getSections(context: TechDocContext): Promise<TechDocSection[]> {
    return [
      {
        id: 'react-component-architecture',
        title: 'React Component Architecture',
        content: `
# React Component Architecture

React uses a **component-based architecture** where UIs are built from small, reusable pieces called components.

## Key Principles

### 1. Component Composition
Components can be combined like LEGO blocks to build complex UIs:

\`\`\`jsx
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
\`\`\`

### 2. Single Responsibility
Each component should have one clear purpose:

- **Header**: Navigation and branding
- **TodoList**: Display and manage todos
- **TodoItem**: Individual todo display

### 3. Props Down, Events Up
Data flows down through props, events flow up through callbacks.

## Best Practices

- **Keep components small** (< 100 lines)
- **Use functional components** with hooks
- **Extract custom hooks** for reusable logic
- **Implement proper TypeScript types**
- **Follow naming conventions** (PascalCase for components)
        `.trim(),
        category: 'framework',
        tags: ['react', 'components', 'architecture', 'best-practices'],
        prerequisites: ['javascript', 'jsx'],
        relatedSections: ['state-management', 'hooks']
      },
      {
        id: 'convex-realtime-database',
        title: 'Convex Real-time Database',
        content: `
# Convex Real-time Database

Convex provides a **real-time database** with automatic subscriptions and ACID transactions.

## Key Features

### 1. Real-time Subscriptions
Data updates automatically sync across all connected clients:

\`\`\`typescript
import { useQuery } from 'convex/react';

function TodoList() {
  const todos = useQuery('listTodos'); // Auto-updates on changes

  return (
    <ul>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </ul>
  );
}
\`\`\`

### 2. Type-safe Schema
Define your database schema with TypeScript:

\`\`\`typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
  todos: defineTable({
    text: 'string',
    completed: 'boolean',
  }).index('by_completion', ['completed']),
});
\`\`\`

### 3. Database Functions
All mutations go through database functions:

\`\`\`typescript
// convex/todos.ts
import { mutation } from './_generated/server';

export const createTodo = mutation({
  args: { text: 'string' },
  handler: async (ctx, args) => {
    return await ctx.db.insert('todos', {
      text: args.text,
      completed: false,
    });
  },
});
\`\`\`

## Best Practices

- **Use database functions** for all mutations
- **Leverage real-time subscriptions** for live updates
- **Implement optimistic updates** for better UX
- **Use proper error boundaries**
- **Monitor query performance**
        `.trim(),
        category: 'backend',
        tags: ['convex', 'database', 'realtime', 'typescript'],
        prerequisites: ['react', 'typescript'],
        relatedSections: ['react-queries', 'error-handling']
      },
      {
        id: 'tailwind-utility-first',
        title: 'Tailwind CSS Utility-First Approach',
        content: `
# Tailwind CSS Utility-First

Tailwind CSS uses a **utility-first approach** where you build custom designs by combining small utility classes.

## Core Concept

Instead of writing custom CSS, you compose utilities:

\`\`\`html
<!-- Instead of custom CSS -->
<button class="btn btn-primary">Click me</button>

<!-- Use utility classes -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
\`\`\`

## Responsive Design

Tailwind includes responsive prefixes:

\`\`\`html
<div class="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>
\`\`\`

## Dark Mode

Built-in dark mode support:

\`\`\`html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Auto dark mode
</div>
\`\`\`

## Best Practices

- **Use semantic class names** when possible
- **Extract repeated patterns** into components
- **Leverage Tailwind plugins** for advanced features
- **Customize design tokens** in tailwind.config.js
- **Use arbitrary values** sparingly
        `.trim(),
        category: 'styling',
        tags: ['tailwind', 'css', 'utilities', 'responsive'],
        prerequisites: ['css-basics']
      },
      {
        id: 'state-management-zustand',
        title: 'State Management with Zustand',
        content: `
# State Management with Zustand

Zustand is a **lightweight state management library** for React that eliminates the need for Context + useReducer.

## Simple Store

\`\`\`typescript
import { create } from 'zustand';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now().toString(), text, completed: false }]
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }))
}));
\`\`\`

## Usage in Components

\`\`\`typescript
function TodoList() {
  const { todos, addTodo, toggleTodo } = useTodoStore();

  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.text} {todo.completed ? '✅' : '⏳'}
        </div>
      ))}
      <button onClick={() => addTodo('New todo')}>Add Todo</button>
    </div>
  );
}
\`\`\`

## Best Practices

- **Keep stores focused** on specific domains
- **Use TypeScript** for type safety
- **Implement proper selectors** for performance
- **Avoid deeply nested state**
- **Use middleware** for persistence and devtools
        `.trim(),
        category: 'stateManagement',
        tags: ['zustand', 'state-management', 'react', 'typescript'],
        prerequisites: ['react-hooks', 'typescript']
      }
    ];
  }

  async getTemplates(context: TechDocContext): Promise<TechDocTemplate[]> {
    return [
      {
        id: 'react-convex-app',
        name: 'React + Convex Application',
        description: 'Complete application template with React frontend and Convex backend',
        framework: 'React',
        backend: 'Convex',
        sections: [
          'react-component-architecture',
          'convex-realtime-database',
          'tailwind-utility-first',
          'state-management-zustand'
        ],
        variables: {
          projectName: context.features.crud ? 'Todo App' : 'Simple App',
          features: Object.entries(context.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature]) => feature)
            .join(', ')
        }
      }
    ];
  }
}

// Singleton instance
export const reactConvexPlugin = new ReactConvexPlugin();