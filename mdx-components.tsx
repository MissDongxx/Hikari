import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components
  };
}

// Export both function and variable for compatibility
export const useMDXComponent = useMDXComponents;
