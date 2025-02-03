import { Template } from '@/types/templates';

export function useTemplates() {
  // In the future, this could fetch available templates from an API
  const templates = [
    {
      id: 'bebop-docs-v1',
      type: 'official-docs',
      name: 'Official Bebop Documentation',
      description: 'Getting started guides and feature documentation',
      details: [
        'A collection of getting started guides',
        'Documentation for all Bebop features',
        'Examples of best practices'
      ]
    }
  ];

  return { templates };
}
