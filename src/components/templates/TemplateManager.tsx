import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TemplateItem } from './TemplateItem';
import { useTemplates } from '@/hooks/useTemplates';

export function TemplateManager() {
  const { templates } = useTemplates();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates & Documentation</CardTitle>
        <CardDescription>
          Import templates and documentation to help you get started with Bebop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Official Documentation Template */}
        <TemplateItem
          type="official-docs"
          templateId="bebop-docs-v1"
          name="Official Bebop Documentation"
          description="Getting started guides and feature documentation"
          details={[
            "A collection of getting started guides",
            "Documentation for all Bebop features",
            "Examples of best practices"
          ]}
        />
      </CardContent>
    </Card>
  );
}