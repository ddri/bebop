'use client';

import type { Destination, DestinationType } from '@repo/database/types';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Mail,
  MessageSquare,
  Settings,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ApiKeysSettingsProps {
  destinations: Destination[];
}

const typeIcons: Record<DestinationType, React.ReactNode> = {
  // Phase 1 Platforms
  HASHNODE: <Globe className="h-4 w-4" />,
  DEVTO: <Globe className="h-4 w-4" />,
  BLUESKY: <MessageSquare className="h-4 w-4" />,
  MASTODON: <MessageSquare className="h-4 w-4" />,
  // Future Platforms
  WORDPRESS: <Globe className="h-4 w-4" />,
  GHOST: <Globe className="h-4 w-4" />,
  MAILCHIMP: <Mail className="h-4 w-4" />,
  SENDGRID: <Mail className="h-4 w-4" />,
  TWITTER: <MessageSquare className="h-4 w-4" />,
  LINKEDIN: <MessageSquare className="h-4 w-4" />,
  FACEBOOK: <MessageSquare className="h-4 w-4" />,
  INSTAGRAM: <MessageSquare className="h-4 w-4" />,
  WEBHOOK: <Settings className="h-4 w-4" />,
  CUSTOM: <Settings className="h-4 w-4" />,
};

const typeColors: Record<DestinationType, string> = {
  // Phase 1 Platforms
  HASHNODE: 'bg-blue-100 text-blue-800',
  DEVTO: 'bg-black-100 text-black-800',
  BLUESKY: 'bg-sky-100 text-sky-800',
  MASTODON: 'bg-purple-100 text-purple-800',
  // Future Platforms
  WORDPRESS: 'bg-blue-100 text-blue-800',
  GHOST: 'bg-gray-100 text-gray-800',
  MAILCHIMP: 'bg-yellow-100 text-yellow-800',
  SENDGRID: 'bg-blue-100 text-blue-800',
  TWITTER: 'bg-blue-100 text-blue-800',
  LINKEDIN: 'bg-blue-100 text-blue-800',
  FACEBOOK: 'bg-blue-100 text-blue-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  WEBHOOK: 'bg-purple-100 text-purple-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

export const ApiKeysSettings = ({ destinations }: ApiKeysSettingsProps) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingDestination, setEditingDestination] = useState<string | null>(
    null
  );
  const router = useRouter();

  const toggleKeyVisibility = (destinationId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [destinationId]: !prev[destinationId],
    }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return 'Not configured';
    return (
      key.slice(0, 4) + '•'.repeat(Math.max(0, key.length - 8)) + key.slice(-4)
    );
  };

  const testConnection = async (destinationId: string) => {
    try {
      const response = await fetch(`/api/destinations/${destinationId}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Connection test successful!');
      } else {
        alert('Connection test failed. Please check your credentials.');
      }
    } catch (error) {
      alert('Connection test failed. Please check your credentials.');
    }
  };

  const deleteDestination = async (destinationId: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      const response = await fetch(`/api/destinations/${destinationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete destination:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys & Integrations</CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage your publishing destination credentials and API keys
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {destinations.length === 0 ? (
              <div className="py-8 text-center">
                <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No destinations configured yet. Add destinations to manage API
                  keys.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/destinations')}
                >
                  Go to Destinations
                </Button>
              </div>
            ) : (
              destinations.map((destination) => (
                <Card
                  key={destination.id}
                  className="border-l-4 border-l-primary/20"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {typeIcons[destination.type]}
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold">
                            {destination.name}
                            <Badge className={typeColors[destination.type]}>
                              {destination.type}
                            </Badge>
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {destination.isActive ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                Inactive
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(destination.id)}
                        >
                          Test Connection
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDestination(destination.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDestination(destination.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {destination.config &&
                        typeof destination.config === 'object' &&
                        Object.entries(
                          destination.config as Record<string, unknown>
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                          >
                            <div>
                              <p className="font-medium text-sm capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {key.toLowerCase().includes('key') ||
                                key.toLowerCase().includes('secret') ||
                                key.toLowerCase().includes('token')
                                  ? showKeys[destination.id]
                                    ? String(value)
                                    : maskApiKey(String(value))
                                  : String(value)}
                              </p>
                            </div>

                            {(key.toLowerCase().includes('key') ||
                              key.toLowerCase().includes('secret') ||
                              key.toLowerCase().includes('token')) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleKeyVisibility(destination.id)
                                }
                              >
                                {showKeys[destination.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 text-muted-foreground text-xs">
                      Created:{' '}
                      {new Date(destination.createdAt).toLocaleDateString()}
                      {destination.updatedAt !== destination.createdAt && (
                        <span className="ml-2">
                          • Updated:{' '}
                          {new Date(destination.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">API Access Token</p>
                <p className="text-muted-foreground text-sm">
                  Personal access token for external integrations
                </p>
              </div>
              <Button variant="outline">Generate Token</Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Webhook Secret</p>
                <p className="text-muted-foreground text-sm">
                  Secret key for webhook verification
                </p>
              </div>
              <Button variant="outline">Regenerate Secret</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
