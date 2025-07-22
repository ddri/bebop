'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import type { Destination } from '@repo/database/types';
import { GeneralSettings } from './general-settings';
import { ApiKeysSettings } from './api-keys-settings';
import { NotificationSettings } from './notification-settings';
import { PublishingSettings } from './publishing-settings';

interface SettingsLayoutProps {
  destinations: Destination[];
}

export const SettingsLayout = ({ destinations }: SettingsLayoutProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeysSettings destinations={destinations} />
        </TabsContent>

        <TabsContent value="publishing" className="space-y-4">
          <PublishingSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};