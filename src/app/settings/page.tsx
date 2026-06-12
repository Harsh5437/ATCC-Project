'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration and user preferences.</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your company information and workspace name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="org-name" className="text-sm font-medium leading-none">Organization Name</label>
              <Input id="org-name" defaultValue="City Traffic Department" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium leading-none">Contact Email</label>
              <Input id="contact" type="email" defaultValue="admin@citytraffic.gov" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Manage your API keys for external integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium leading-none">Production API Key</label>
              <div className="flex gap-2">
                <Input id="api-key" type="password" defaultValue="sk_live_1234567890" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
            </div>
            <Button variant="destructive">Regenerate Key</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
