'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Webhook,
  Plus,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Settings
} from 'lucide-react';

interface WebhookConfig {
  id?: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  secret?: string;
}

const WEBHOOK_EVENTS = [
  { value: 'content.created', label: 'Content Created', description: 'When new content is created' },
  { value: 'content.updated', label: 'Content Updated', description: 'When content is modified' },
  { value: 'content.published', label: 'Content Published', description: 'When content is published' },
  { value: 'content.scheduled', label: 'Content Scheduled', description: 'When content is scheduled' },
  { value: 'publish.success', label: 'Publish Success', description: 'When publishing succeeds' },
  { value: 'publish.failed', label: 'Publish Failed', description: 'When publishing fails' },
  { value: 'campaign.created', label: 'Campaign Created', description: 'When a campaign is created' },
  { value: 'campaign.updated', label: 'Campaign Updated', description: 'When a campaign is modified' },
];

const PLATFORM_TEMPLATES = [
  {
    name: 'Zapier',
    icon: '⚡',
    urlPattern: 'https://hooks.zapier.com/',
    description: 'Connect to 5,000+ apps',
    color: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    name: 'Make.com',
    icon: '🔄',
    urlPattern: 'https://hook.eu1.make.com/',
    description: 'Visual automation platform',
    color: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    name: 'n8n',
    icon: '🔧',
    urlPattern: 'http://localhost:5678/webhook/',
    description: 'Self-hosted automation',
    color: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    name: 'Custom',
    icon: '🔗',
    urlPattern: '',
    description: 'Your own webhook endpoint',
    color: 'bg-slate-500/10 border-slate-500/20',
  },
];

export function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState<WebhookConfig>({
    name: '',
    url: '',
    events: [],
    enabled: true,
  });
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load webhooks
  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  };

  const handleCreateWebhook = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      });

      if (!response.ok) {
        throw new Error('Failed to create webhook');
      }

      const webhook = await response.json();
      setWebhooks([...webhooks, webhook]);
      setNewWebhook({ name: '', url: '', events: [], enabled: true });
      setIsCreating(false);
      setSuccess('Webhook created successfully!');
    } catch (error) {
      setError('Failed to create webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    if (!webhook.id) return;

    setTestResults({ ...testResults, [webhook.id]: null });

    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: webhook.id }),
      });

      const result = await response.json();
      setTestResults({ ...testResults, [webhook.id]: result.success });

      if (!result.success) {
        setError(result.message || 'Webhook test failed');
      }
    } catch (error) {
      setTestResults({ ...testResults, [webhook.id]: false });
      setError('Failed to test webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== id));
        setSuccess('Webhook deleted');
      }
    } catch (error) {
      setError('Failed to delete webhook');
    }
  };

  const handleToggleWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...webhook,
          enabled: !webhook.enabled,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setWebhooks(webhooks.map(w => w.id === updated.id ? updated : w));
      }
    } catch (error) {
      setError('Failed to update webhook');
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setSuccess('Secret copied to clipboard');
  };

  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Integrations
            </CardTitle>
            <CardDescription className="text-slate-300 mt-2">
              Connect Bebop to automation platforms like Zapier, Make.com, or n8n
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform templates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORM_TEMPLATES.map(platform => (
            <div
              key={platform.name}
              className={`p-3 rounded-lg border ${platform.color} cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => {
                if (isCreating) {
                  setNewWebhook({
                    ...newWebhook,
                    name: `${platform.name} Integration`,
                    url: platform.urlPattern,
                  });
                }
              }}
            >
              <div className="text-2xl mb-1">{platform.icon}</div>
              <div className="text-sm font-medium text-white">{platform.name}</div>
              <div className="text-xs text-slate-400">{platform.description}</div>
            </div>
          ))}
        </div>

        {/* Create new webhook form */}
        {isCreating && (
          <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
            <h3 className="text-white font-medium">New Webhook</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="My Zapier Integration"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-slate-300">Webhook URL</Label>
              <Input
                id="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://hooks.zapier.com/..."
                className="bg-slate-900 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-400">
                Enter the webhook URL from your automation platform
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Events to trigger</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map(event => (
                  <label
                    key={event.value}
                    className="flex items-start space-x-2 cursor-pointer p-2 rounded hover:bg-slate-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...newWebhook.events, event.value],
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: newWebhook.events.filter(ev => ev !== event.value),
                          });
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white">{event.label}</div>
                      <div className="text-xs text-slate-400">{event.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateWebhook}
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0 || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Webhook
              </Button>
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setNewWebhook({ name: '', url: '', events: [], enabled: true });
                }}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing webhooks */}
        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div
              key={webhook.id}
              className="p-4 bg-slate-800/50 rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{webhook.name}</h4>
                    <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                      {webhook.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    {testResults[webhook.id!] !== undefined && (
                      testResults[webhook.id!] ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mt-1 font-mono break-all">
                    {webhook.url}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.enabled}
                    onCheckedChange={() => handleToggleWebhook(webhook)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook)}
                    className="border-slate-600"
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWebhook(webhook.id!)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {webhook.secret && (
                <div className="flex items-center gap-2 p-2 bg-slate-900 rounded text-xs">
                  <span className="text-slate-400">Secret:</span>
                  <code className="text-slate-300 flex-1">
                    {webhook.secret.substring(0, 20)}...
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copySecret(webhook.secret!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {webhooks.length === 0 && !isCreating && (
          <div className="text-center py-8 text-slate-400">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No webhooks configured</p>
            <p className="text-sm mt-1">
              Add a webhook to connect Bebop with your automation tools
            </p>
          </div>
        )}

        {/* Status messages */}
        {error && (
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {/* Documentation */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            How to Use Webhooks
          </h4>
          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
            <li>Choose your automation platform (Zapier, Make.com, n8n, etc.)</li>
            <li>Create a webhook trigger in your automation workflow</li>
            <li>Copy the webhook URL from your platform</li>
            <li>Add it here and select which events should trigger it</li>
            <li>Test the connection to ensure it works</li>
            <li>Your automation will run whenever the selected events occur!</li>
          </ol>
          <div className="mt-3 flex gap-2">
            <a
              href="https://zapier.com/apps/webhook/help"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Zapier Guide <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.make.com/en/help/tools/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Make.com Guide <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              n8n Guide <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}