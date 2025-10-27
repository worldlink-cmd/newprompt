'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Image as ImageIcon, Check, X, Clock, AlertCircle, PenTool } from 'lucide-react';
import { OrderAttachment, ApprovalStatus, ImageType } from '../../types';

interface OrderAttachmentsProps {
  attachments: OrderAttachment[];
  onApprovalUpdate: (attachmentId: string, status: ApprovalStatus, notes?: string, signature?: string) => Promise<void>;
  readonly?: boolean;
}

export function OrderAttachments({ attachments, onApprovalUpdate, readonly = false }: OrderAttachmentsProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<OrderAttachment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return <Check className="h-4 w-4 text-green-600" />;
      case ApprovalStatus.REJECTED:
        return <X className="h-4 w-4 text-red-600" />;
      case ApprovalStatus.REVISION_REQUESTED:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case ApprovalStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApprovalStatus.REVISION_REQUESTED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: ImageType) => {
    switch (type) {
      case ImageType.DESIGN_REFERENCE:
        return 'Design Reference';
      case ImageType.FINISHED_GARMENT:
        return 'Finished Garment';
      case ImageType.CUSTOMER_PHOTO:
        return 'Customer Photo';
      case ImageType.FABRIC_SAMPLE:
        return 'Fabric Sample';
      default:
        return 'Unknown';
    }
  };

  const handleApproval = async (status: ApprovalStatus) => {
    if (!selectedAttachment) return;

    setIsSubmitting(true);
    try {
      await onApprovalUpdate(selectedAttachment.id, status, approvalNotes);
      setSelectedAttachment(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error updating approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Order Attachments</h3>
        <Badge variant="outline">{attachments.length} files</Badge>
      </div>

      {attachments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No attachments uploaded</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm">{getTypeLabel(attachment.type)}</CardTitle>
                    {attachment.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {attachment.description}
                      </p>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(attachment.approvalStatus)}`}>
                    {getStatusIcon(attachment.approvalStatus)}
                    <span className="ml-1 capitalize">
                      {attachment.approvalStatus.replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {attachment.image && (
                  <div className="mb-3">
                    <img
                      src={attachment.image.url}
                      alt={attachment.description || getTypeLabel(attachment.type)}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {attachment.approvalNotes && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Notes:</strong> {attachment.approvalNotes}
                    </div>
                  )}

                  {attachment.approvedByUser && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Approved by:</strong> {attachment.approvedByUser.name}
                    </div>
                  )}

                  {attachment.approvedAt && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Date:</strong> {new Date(attachment.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {!readonly && attachment.approvalStatus === ApprovalStatus.PENDING && (
                  <div className="mt-3 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedAttachment(attachment)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Attachment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Approval Notes (Optional)</label>
                            <Textarea
                              value={approvalNotes}
                              onChange={(e) => setApprovalNotes(e.target.value)}
                              placeholder="Add any notes about this approval..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproval(ApprovalStatus.APPROVED)}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleApproval(ApprovalStatus.REVISION_REQUESTED)}
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              Request Revision
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproval(ApprovalStatus.REJECTED)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
