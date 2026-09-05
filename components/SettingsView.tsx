'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Shield, Bell, Lock, User, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const { profile, updateProfile } = useAppStore();

  const handleSave = () => {
    toast.success('Settings saved securely.');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Settings</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile.name} 
              onChange={(e) => updateProfile({ name: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={profile.email} 
              onChange={(e) => updateProfile({ email: e.target.value })} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security & Privacy</CardTitle>
          <CardDescription>Control your data and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Switch 
              checked={profile.twoFactorEnabled} 
              onCheckedChange={(c) => updateProfile({ twoFactorEnabled: c })} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Share Portfolio Data</Label>
              <p className="text-sm text-muted-foreground">Allow social sharing of your investment ideas anonymously.</p>
            </div>
            <Switch 
              checked={profile.sharePortfolio} 
              onCheckedChange={(c) => updateProfile({ sharePortfolio: c })} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">End-to-End Encryption</Label>
              <p className="text-sm text-muted-foreground">Your sensitive financial data is encrypted at rest.</p>
            </div>
            <Lock className="w-5 h-5 text-success shadow-[0_0_10px_rgba(52,211,153,0.3)] rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Investment Profile</CardTitle>
          <CardDescription>Helps tailor AI strategies to your needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base">Risk Tolerance</Label>
              <span className="text-sm font-medium uppercase text-primary px-3 py-1 bg-primary/10 rounded-full">
                {profile.riskTolerance}
              </span>
            </div>
            <div className="pt-2">
              <Slider 
                defaultValue={[profile.riskTolerance === 'low' ? 0 : profile.riskTolerance === 'medium' ? 50 : 100]} 
                max={100} 
                step={50}
                onValueChange={(vals) => {
                  const val = Array.isArray(vals) ? vals[0] : (vals as any)[0] ?? vals;
                  let tolerance: 'low' | 'medium' | 'high' = 'medium';
                  if (val === 0) tolerance = 'low';
                  if (val === 100) tolerance = 'high';
                  updateProfile({ riskTolerance: tolerance });
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
