import { z } from 'zod';

// Mobile App Configuration Validation
export const createMobileConfigSchema = z.object({
  appName: z.string().min(1, 'App name is required').max(50, 'App name must be less than 50 characters'),
  appVersion: z.string().min(1, 'App version is required'),
  buildNumber: z.string().min(1, 'Build number is required'),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color'),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Background color must be a valid hex color'),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Text color must be a valid hex color'),
  }),
  features: z.object({
    offlineMode: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    biometricAuth: z.boolean().default(false),
    cameraAccess: z.boolean().default(true),
    locationAccess: z.boolean().default(false),
    fileUpload: z.boolean().default(true),
  }),
  navigation: z.object({
    showBottomNav: z.boolean().default(true),
    showSidebar: z.boolean().default(false),
    defaultRoute: z.string().default('/dashboard'),
    menuItems: z.array(z.object({
      id: z.string().min(1, 'Menu item ID is required'),
      label: z.string().min(1, 'Menu item label is required'),
      icon: z.string().min(1, 'Menu item icon is required'),
      route: z.string().min(1, 'Menu item route is required'),
      requiresAuth: z.boolean().default(true),
      roles: z.array(z.string()).optional(),
    })).default([]),
  }),
  performance: z.object({
    cacheTimeout: z.number().int().min(300, 'Cache timeout must be at least 300 seconds').default(3600),
    maxOfflineStorage: z.number().int().min(10, 'Max offline storage must be at least 10MB').default(100),
    imageQuality: z.number().int().min(60, 'Image quality must be at least 60%').max(100, 'Image quality must be at most 100%').default(80),
    lazyLoading: z.boolean().default(true),
  }),
});

export const updateMobileConfigSchema = createMobileConfigSchema.partial().extend({
  id: z.string().optional(),
});

// Push Notification Validation
export const createPushNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  body: z.string().min(1, 'Body is required').max(500, 'Body must be less than 500 characters'),
  icon: z.string().url('Invalid icon URL').optional(),
  image: z.string().url('Invalid image URL').optional(),
  badge: z.string().url('Invalid badge URL').optional(),
  tag: z.string().max(50, 'Tag must be less than 50 characters').optional(),
  data: z.any().optional(),
  actions: z.array(z.object({
    action: z.string().min(1, 'Action is required'),
    title: z.string().min(1, 'Action title is required'),
    icon: z.string().url('Invalid action icon URL').optional(),
  })).max(2, 'Maximum 2 actions allowed').optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  timestamp: z.coerce.date().default(new Date()),
  target: z.object({
    userId: z.string().optional(),
    role: z.string().optional(),
    segmentId: z.string().optional(),
    allUsers: z.boolean().default(false),
  }),
});

export const updatePushNotificationSchema = createPushNotificationSchema.partial().extend({
  id: z.string().optional(),
});

// Offline Queue Validation
export const createOfflineQueueSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE'], {
    required_error: 'Action is required',
  }),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  data: z.any(),
  timestamp: z.coerce.date().default(new Date()),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(1).max(10).default(3),
});

export const updateOfflineQueueSchema = createOfflineQueueSchema.partial().extend({
  id: z.string().optional(),
});

// Mobile Analytics Validation
export const createMobileAnalyticsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  eventType: z.enum(['SCREEN_VIEW', 'BUTTON_CLICK', 'FORM_SUBMIT', 'ERROR', 'PERFORMANCE', 'CUSTOM'], {
    required_error: 'Event type is required',
  }),
  eventName: z.string().min(1, 'Event name is required').max(100, 'Event name must be less than 100 characters'),
  screenName: z.string().max(100, 'Screen name must be less than 100 characters').optional(),
  componentName: z.string().max(100, 'Component name must be less than 100 characters').optional(),
  properties: z.any().optional(),
  timestamp: z.coerce.date().default(new Date()),
  deviceInfo: z.object({
    platform: z.enum(['IOS', 'ANDROID', 'WEB']),
    version: z.string().optional(),
    model: z.string().optional(),
    screenSize: z.string().optional(),
  }).optional(),
});

export const updateMobileAnalyticsSchema = createMobileAnalyticsSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateMobileConfigInput = z.infer<typeof createMobileConfigSchema>;
export type UpdateMobileConfigInput = z.infer<typeof updateMobileConfigSchema>;
export type CreatePushNotificationInput = z.infer<typeof createPushNotificationSchema>;
export type UpdatePushNotificationInput = z.infer<typeof updatePushNotificationSchema>;
export type CreateOfflineQueueInput = z.infer<typeof createOfflineQueueSchema>;
export type UpdateOfflineQueueInput = z.infer<typeof updateOfflineQueueSchema>;
export type CreateMobileAnalyticsInput = z.infer<typeof createMobileAnalyticsSchema>;
export type UpdateMobileAnalyticsInput = z.infer<typeof updateMobileAnalyticsSchema>;
