'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { ScheduleTemplate, ShiftType } from '../../types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface ScheduleTemplateTableProps {
  templates: ScheduleTemplate[];
  onEdit: (template: ScheduleTemplate) => void;
  onRefresh: () => void;
  userRole: string | null;
}

export function ScheduleTemplateTable({ templates, onEdit, onRefresh, userRole }: ScheduleTemplateTableProps) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    template: null as ScheduleTemplate | null,
  });

  const getShiftTypeColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case ShiftType.MORNING:
        return 'bg-yellow-100 text-yellow-800';
      case ShiftType.AFTERNOON:
        return 'bg-orange-100 text-orange-800';
      case ShiftType.EVENING:
        return 'bg-blue-100 text-blue-800';
      case ShiftType.NIGHT:
        return 'bg-purple-100 text-purple-800';
      case ShiftType.SPLIT:
        return 'bg-green-100 text-green-800';
      case ShiftType.CUSTOM:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDelete = (template: ScheduleTemplate) => {
    setDeleteDialog({
      open: true,
      template,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.template) return;

    try {
      const response = await fetch(`/api/schedules/templates/${deleteDialog.template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setDeleteDialog({ open: false, template: null });
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No schedule templates</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first schedule template to get started with shift planning.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <Badge className={getShiftTypeColor(template.shiftType)}>
                    {template.shiftType}
                  </Badge>
                  {!template.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-muted-foreground">{template.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(template.startTime)} - {formatTime(template.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{template.breakDuration}min break</span>
                  </div>
                </div>
              </div>

              {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.template?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
