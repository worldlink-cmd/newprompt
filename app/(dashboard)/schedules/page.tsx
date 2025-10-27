'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import { ScheduleTemplateTable } from '../../../components/schedules/schedule-template-table';
import { ScheduleTemplateDialog } from '../../../components/schedules/schedule-template-dialog';
import { EmployeeScheduleCalendar } from '../../../components/schedules/employee-schedule-calendar';
import { ScheduleTemplate, ScheduleTemplateFormData } from '../../../types';

export default function SchedulesPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [templateDialog, setTemplateDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    selectedTemplate: null as ScheduleTemplate | null,
  });

  // Fetch schedule templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/schedules/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch schedule templates');
      }

      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handler functions
  const handleCreateTemplate = () => {
    setTemplateDialog({
      open: true,
      mode: 'create',
      selectedTemplate: null,
    });
  };

  const handleEditTemplate = (template: ScheduleTemplate) => {
    setTemplateDialog({
      open: true,
      mode: 'edit',
      selectedTemplate: template,
    });
  };

  const handleTemplateSuccess = () => {
    fetchTemplates();
    setTemplateDialog({ open: false, mode: 'create', selectedTemplate: null });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Schedule Management</h1>
              <p className="text-muted-foreground">
                Manage work schedules, shift templates, and employee assignments
              </p>
            </div>
            {(session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'MANAGER' ? (
              <Button onClick={handleCreateTemplate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchTemplates} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Shift Templates
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedule Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage standard shift templates for different work schedules
              </p>
            </CardHeader>
            <CardContent>
              <ScheduleTemplateTable
                templates={templates}
                onEdit={handleEditTemplate}
                onRefresh={fetchTemplates}
                userRole={(session?.user as any)?.role || null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Schedule Calendar</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage employee schedules in a calendar format
              </p>
            </CardHeader>
            <CardContent>
              <EmployeeScheduleCalendar
                templates={templates}
                onRefresh={fetchTemplates}
                userRole={(session?.user as any)?.role || null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Template Dialog */}
      <ScheduleTemplateDialog
        open={templateDialog.open}
        onOpenChange={(open) => setTemplateDialog(prev => ({ ...prev, open }))}
        mode={templateDialog.mode}
        template={templateDialog.selectedTemplate || undefined}
        onSuccess={handleTemplateSuccess}
      />
    </div>
  );
}
