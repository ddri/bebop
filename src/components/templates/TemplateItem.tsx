import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { TemplateType, TemplateImportResponse } from '@/types/templates';
import Link from 'next/link';

interface TemplateItemProps {
  type: TemplateType;
  templateId: string;
  name: string;
  description: string;
  details: string[];
}

export function TemplateItem({ type, templateId, name, description, details }: TemplateItemProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TemplateImportResponse | null>(null);

  const importTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, templateId }),
      });

      const data: TemplateImportResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import template');
      }

      if (data.success) {
        setSuccess(data);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <Button 
          onClick={importTemplate}
          disabled={loading || !!success}
          variant={success ? "outline" : "default"}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : success ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Importing...' : success ? 'Imported' : 'Import'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <p>Successfully imported:</p>
            <ul className="mt-2 list-disc list-inside">
              {success.collections?.map(collection => (
                <li key={collection.id} className="flex items-center justify-between">
                  <span>Collection: {collection.name}</span>
                  <Link 
                    href={`/collections/${collection.id}`}
                    className="text-blue-500 hover:text-blue-600 inline-flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </li>
              ))}
              <li>{success.topics?.length} topics imported</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!success && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2">
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}