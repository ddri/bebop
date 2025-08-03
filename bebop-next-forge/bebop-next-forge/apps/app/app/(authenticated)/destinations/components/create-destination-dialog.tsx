'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Destination, DestinationType } from '@repo/database/types';
import {
  Alert,
  AlertDescription,
} from '@repo/design-system/components/ui/alert';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Switch } from '@repo/design-system/components/ui/switch';
import {
  AlertCircle,
  ExternalLink,
  Info,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  getHelpText,
  phase1Platforms,
  platformCategories,
  platformConfigurations,
  platformIcons,
} from './platform-configurations';

const createDestinationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(DestinationType),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  username: z.string().optional(),
  additionalConfig: z.record(z.any()).optional(),
});

type CreateDestinationForm = z.infer<typeof createDestinationSchema>;

interface CreateDestinationDialogProps {
  children: React.ReactNode;
  editingDestination?: Destination;
  onClose?: () => void;
}

export const CreateDestinationDialog = ({
  children,
  editingDestination,
  onClose,
}: CreateDestinationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const router = useRouter();
  const isEditing = !!editingDestination;

  const form = useForm<CreateDestinationForm>({
    resolver: zodResolver(createDestinationSchema),
    defaultValues: {
      name: '',
      type: DestinationType.HASHNODE,
      apiKey: '',
      apiSecret: '',
      url: '',
      username: '',
      additionalConfig: {},
    },
  });

  // Update form when editingDestination changes
  React.useEffect(() => {
    if (editingDestination) {
      const config =
        editingDestination.config &&
        typeof editingDestination.config === 'object' &&
        !Array.isArray(editingDestination.config)
          ? (editingDestination.config as Record<string, unknown>)
          : {};

      // Extract core fields
      const { apiKey, apiSecret, url, username, ...additionalConfig } = config;

      form.reset({
        name: editingDestination.name,
        type: editingDestination.type,
        apiKey: (apiKey as string) || '',
        apiSecret: (apiSecret as string) || '',
        url: (url as string) || '',
        username: (username as string) || '',
        additionalConfig: additionalConfig,
      });
      setOpen(true);
    }
  }, [editingDestination, form]);

  const selectedType = form.watch('type');
  const fieldConfig = platformConfigurations[selectedType];

  const onSubmit = async (data: CreateDestinationForm) => {
    try {
      // Build config object based on destination type
      const config: Record<string, unknown> = {
        ...data.additionalConfig,
      };

      if (data.apiKey) config.apiKey = data.apiKey;
      if (data.apiSecret) config.apiSecret = data.apiSecret;
      if (data.url) config.url = data.url;
      if (data.username) config.username = data.username;

      const url = isEditing
        ? `/api/destinations/${editingDestination.id}`
        : '/api/destinations';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing
        ? { name: data.name, type: data.type, config }
        : { name: data.name, type: data.type, config, isActive: true };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setOpen(false);
        form.reset();
        onClose?.();
        router.refresh();
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? 'update' : 'create'} destination:`,
        error
      );
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // TODO: Implement connection testing
    setTimeout(() => {
      setIsTestingConnection(false);
    }, 2000);
  };

  const destinationTypeLabels: Record<DestinationType, string> = {
    HASHNODE: 'Hashnode',
    DEVTO: 'Dev.to',
    BLUESKY: 'Bluesky',
    MASTODON: 'Mastodon',
    WORDPRESS: 'WordPress',
    GHOST: 'Ghost',
    MAILCHIMP: 'Mailchimp',
    SENDGRID: 'SendGrid',
    TWITTER: 'Twitter',
    LINKEDIN: 'LinkedIn',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    WEBHOOK: 'Webhook',
    CUSTOM: 'Custom',
  };

  return (
    <Dialog
      open={isEditing || open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isEditing
              ? 'Edit Publishing Destination'
              : 'Add Publishing Destination'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your destination settings and configuration.'
              : 'Configure a new destination where your content can be published.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My Tech Blog, Company Updates"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this destination
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(platformCategories).map(
                        ([category, platforms]) => (
                          <React.Fragment key={category}>
                            <div className="px-2 py-1.5 font-semibold text-muted-foreground text-sm">
                              {category}
                            </div>
                            {platforms
                              .filter((platform) =>
                                category === 'Coming Soon'
                                  ? false
                                  : phase1Platforms.includes(platform)
                              )
                              .map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  <div className="flex items-center gap-2">
                                    {platformIcons[platform]}
                                    <span>
                                      {destinationTypeLabels[platform]}
                                    </span>
                                    {platform === DestinationType.HASHNODE && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 text-xs"
                                      >
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            {category === 'Coming Soon' && (
                              <div className="px-2 py-2 text-muted-foreground text-sm italic">
                                More platforms coming soon...
                              </div>
                            )}
                            {category !== 'Coming Soon' && (
                              <Separator className="my-1" />
                            )}
                          </React.Fragment>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="mt-2 flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{fieldConfig.description}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Platform-specific help text */}
            {getHelpText(selectedType) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getHelpText(selectedType)}
                  {fieldConfig.helpLink && (
                    <a
                      href={fieldConfig.helpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Core authentication fields */}
            <div className="space-y-4">
              {fieldConfig.needsUrl && (
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldConfig.urlLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === DestinationType.MASTODON
                              ? 'https://mastodon.social'
                              : 'https://example.com'
                          }
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      {selectedType === DestinationType.MASTODON && (
                        <FormDescription>
                          The URL of your Mastodon instance (without trailing
                          slash)
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {fieldConfig.needsUsername && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldConfig.usernameLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === DestinationType.BLUESKY
                              ? 'yourhandle.bsky.social'
                              : 'username'
                          }
                          {...field}
                        />
                      </FormControl>
                      {selectedType === DestinationType.BLUESKY && (
                        <FormDescription>
                          Your full Bluesky handle including domain
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {fieldConfig.needsApiKey && (
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {fieldConfig.apiKeyLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your secure token..."
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {fieldConfig.needsApiSecret && (
                <FormField
                  control={form.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {fieldConfig.apiSecretLabel || 'API Secret'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your API secret..."
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Additional platform-specific fields */}
            {fieldConfig.additionalFields &&
              fieldConfig.additionalFields.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">
                      Platform-Specific Settings
                    </h4>
                    {fieldConfig.additionalFields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={
                          `additionalConfig.${field.name}` as `additionalConfig.${string}`
                        }
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.label}
                              {field.required && (
                                <span className="ml-1 text-destructive">*</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              {field.type === 'boolean' ? (
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={formField.value || false}
                                    onCheckedChange={formField.onChange}
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    {field.description}
                                  </span>
                                </div>
                              ) : field.type === 'select' ? (
                                <Select
                                  onValueChange={formField.onChange}
                                  defaultValue={formField.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={`Select ${field.label.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  {...formField}
                                />
                              )}
                            </FormControl>
                            {field.description && field.type !== 'boolean' && (
                              <FormDescription>
                                {field.description}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </>
              )}

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
                className="mr-auto"
              >
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    onClose?.();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Destination' : 'Add Destination'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
