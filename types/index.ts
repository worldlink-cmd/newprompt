import { User } from 'next-auth';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CUTTER = 'CUTTER',
  STITCHER = 'STITCHER',
  PRESSER = 'PRESSER',
  DELIVERY = 'DELIVERY',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum PreferredContactMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

// Customer types (will be inferred from Prisma schema)
export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  notes: string | null;
  preferredContactMethod: PreferredContactMethod | null;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  measurements: Measurement[];
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  notes?: string;
  preferredContactMethod?: PreferredContactMethod;
}

export interface CustomerListItem {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  preferredContactMethod: PreferredContactMethod | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CustomerSearchParams {
  search?: string;
  gender?: Gender;
  preferredContactMethod?: PreferredContactMethod;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Add more types here as the application grows

export enum GarmentType {
  SHIRT = 'SHIRT',
  SUIT = 'SUIT',
  DRESS = 'DRESS',
  TROUSER = 'TROUSER',
}

export enum OrderType {
  BESPOKE_SUIT = 'BESPOKE_SUIT',
  DRESS_ALTERATION = 'DRESS_ALTERATION',
  ONE_PIECE = 'ONE_PIECE',
  SUIT_ALTERATION = 'SUIT_ALTERATION',
  CUSTOM_DESIGN = 'CUSTOM_DESIGN',
  REPAIR = 'REPAIR',
}

export enum MeasurementUnit {
  CM = 'CM',
  INCH = 'INCH',
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  CUTTING = 'CUTTING',
  STITCHING = 'STITCHING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  PRESSING = 'PRESSING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Measurement {
  id: string;
  customerId: string;
  customer?: Customer;
  garmentType: GarmentType;
  unit: MeasurementUnit;
  measurements: Record<string, number>;
  notes?: string;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface MeasurementFormData {
  garmentType: GarmentType;
  unit: MeasurementUnit;
  measurements: Record<string, number>;
  notes?: string;
}

export interface MeasurementField {
  name: string;
  label: string;
  unit: string;
  required: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  step?: number;
  type?: 'number' | 'text' | 'select' | 'boolean' | 'textarea';
  options?: string[];
}

export interface MeasurementTemplate {
  garmentType: GarmentType;
  fields: MeasurementField[];
  description: string;
}

export interface MeasurementSearchParams {
  customerId?: string;
  garmentType?: GarmentType;
  isLatest?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: {
    id: string;
    customerNumber: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string;
  };
  measurementId?: string | null;
  measurement?: {
    id: string;
    garmentType: GarmentType;
    unit: MeasurementUnit;
    measurements: Record<string, number>;
    version: number;
    isLatest: boolean;
  };
  garmentType: GarmentType;
  orderType: OrderType;
  serviceDescription: string;
  specialInstructions?: string | null;
  orderDate: Date;
  deliveryDate: Date;
  status: OrderStatus;
  priority: OrderPriority;
  totalAmount?: number | null;
  depositAmount?: number | null;
  balanceAmount?: number | null;
  isUrgent: boolean;
  // New fields for order type extensions
  pieces?: any; // JSON for multi-piece orders
  originalMeasurements?: any; // JSON for alterations
  modifiedMeasurements?: any; // JSON for alterations
  alterationNotes?: string | null;
  alterationHistory?: any; // JSON for alteration history
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface OrderFormData {
  customerId: string;
  measurementId?: string;
  garmentType: GarmentType;
  orderType: OrderType;
  serviceDescription: string;
  specialInstructions?: string;
  deliveryDate: Date;
  priority: OrderPriority;
  totalAmount?: number;
  depositAmount?: number;
  isUrgent: boolean;
  // New fields for order type extensions
  pieces?: any; // JSON for multi-piece orders
  originalMeasurements?: any; // JSON for alterations
  modifiedMeasurements?: any; // JSON for alterations
  alterationNotes?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    customerNumber: string;
  };
  garmentType: GarmentType;
  orderType: OrderType;
  serviceDescription: string;
  orderDate: Date;
  deliveryDate: Date;
  status: OrderStatus;
  priority: OrderPriority;
  totalAmount?: number | null;
  isUrgent: boolean;
}

export interface OrderSearchParams {
  search?: string;
  customerId?: string;
  status?: OrderStatus;
  garmentType?: GarmentType;
  orderType?: OrderType;
  priority?: OrderPriority;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Order history types for workflow tracking
export interface OrderHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  notes?: string | null;
  timestamp: Date;
  createdAt: Date;
}

export interface OrderWithHistory extends Order {
  history: OrderHistory[];
}

// New types for fabric and design catalog
export enum FabricCategory {
  COTTON = 'COTTON',
  WOOL = 'WOOL',
  SILK = 'SILK',
  LINEN = 'LINEN',
  SYNTHETIC = 'SYNTHETIC',
  BLEND = 'BLEND',
}

export enum InventoryCategory {
  SUIT_FABRICS = 'SUIT_FABRICS',
  DRESS_MATERIALS = 'DRESS_MATERIALS',
  LININGS = 'LININGS',
  NOTIONS = 'NOTIONS',
  ACCESSORIES = 'ACCESSORIES',
  THREADS = 'THREADS',
  BUTTONS = 'BUTTONS',
  ZIPPERS = 'ZIPPERS',
  INTERFACINGS = 'INTERFACINGS',
  OTHER = 'OTHER',
}

export enum InventoryTransactionType {
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER',
}

export enum DesignCategory {
  CASUAL = 'CASUAL',
  FORMAL = 'FORMAL',
  TRADITIONAL = 'TRADITIONAL',
  MODERN = 'MODERN',
  VINTAGE = 'VINTAGE',
}

export enum ImageType {
  FABRIC_SAMPLE = 'FABRIC_SAMPLE',
  DESIGN_REFERENCE = 'DESIGN_REFERENCE',
  FINISHED_GARMENT = 'FINISHED_GARMENT',
  CUSTOMER_PHOTO = 'CUSTOMER_PHOTO',
}



export interface Fabric {
  id: string;
  name: string;
  description?: string | null;
  category: FabricCategory;
  color?: string | null;
  pattern?: string | null;
  material?: string | null;
  pricePerMeter?: number | null;
  stockQuantity: number;
  minOrderQuantity: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  designs: Design[];
}

export interface Design {
  id: string;
  name: string;
  description?: string | null;
  category: DesignCategory;
  style?: string | null;
  imageUrl?: string | null;
  fabricId?: string | null;
  fabric?: Fabric | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface Image {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  width?: number | null;
  height?: number | null;
  optimized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderAttachment {
  id: string;
  orderId: string;
  order?: Order;
  imageId: string;
  image?: Image;
  type: ImageType;
  description?: string | null;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string | null;
  approvedBy?: string | null;
  approvedByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  approvedAt?: Date | null;
  signatureData?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FabricFormData {
  name: string;
  description?: string;
  category: FabricCategory;
  color?: string;
  pattern?: string;
  material?: string;
  pricePerMeter?: number;
  stockQuantity: number;
  minOrderQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface DesignFormData {
  name: string;
  description?: string;
  category: DesignCategory;
  style?: string;
  imageUrl?: string;
  fabricId?: string;
  isActive: boolean;
}

export interface ImageUploadResponse {
  id: string;
  filename: string;
  url: string;
  width?: number;
  height?: number;
  size: number;
}

// Employee types
export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  hireDate: Date;
  role: UserRole;
  salary: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  skills: EmployeeSkill[];
  specializations: EmployeeSpecialization[];
  createdOrders: Order[];
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  hireDate?: Date;
  role: UserRole;
  salary?: number;
  notes?: string;
  skillIds?: string[];
  specializationIds?: string[];
}

export interface EmployeeListItem {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface EmployeeSearchParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employees: EmployeeSkill[];
}

export interface Specialization {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  employees: EmployeeSpecialization[];
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  employee: Employee;
  skillId: string;
  skill: Skill;
  proficiencyLevel: string | null;
  createdAt: Date;
}

export interface EmployeeSpecialization {
  id: string;
  employeeId: string;
  employee: Employee;
  specializationId: string;
  specialization: Specialization;
  assignedDate: Date;
  notes: string | null;
  createdAt: Date;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum TaskPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStage {
  RECEIVED = 'RECEIVED',
  CUTTING = 'CUTTING',
  STITCHING = 'STITCHING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  PRESSING = 'PRESSING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Task types
export interface Task {
  id: string;
  orderId: string;
  order?: Order;
  stage: TaskStage;
  assignedEmployeeId?: string | null;
  assignedEmployee?: Employee | null;
  deadline?: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours?: number | null;
  actualHours?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date | null;
  completedAt?: Date | null;
  history: TaskHistory[];
}

export interface TaskFormData {
  orderId: string;
  stage: TaskStage;
  assignedEmployeeId?: string;
  deadline?: Date;
  priority: TaskPriority;
  estimatedHours?: number;
  notes?: string;
}

export interface TaskListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  stage: TaskStage;
  assignedEmployee?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  } | null;
  deadline?: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt: Date;
}

export interface TaskSearchParams {
  search?: string;
  orderId?: string;
  stage?: TaskStage;
  assignedEmployeeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  overdue?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  status: TaskStatus;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  notes?: string | null;
  timestamp: Date;
  createdAt: Date;
}

export interface TaskWithHistory extends Task {
  history: TaskHistory[];
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

// Re-export task validation types
export type CreateTaskInput = {
  orderId: string;
  stage: TaskStage;
  assignedEmployeeId?: string;
  deadline?: Date;
  priority: TaskPriority;
  estimatedHours?: number;
  notes?: string;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  id?: string;
  status?: TaskStatus;
  actualHours?: number;
};

export type UpdateTaskStatusInput = {
  status: TaskStatus;
  notes?: string;
  actualHours?: number;
};

export type AssignTaskInput = {
  taskId: string;
  employeeId: string;
  notes?: string;
};

// Schedule and Attendance Types
export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  SPLIT = 'SPLIT',
  CUSTOM = 'CUSTOM',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  OVERTIME = 'OVERTIME',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveTypeEnum {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}



export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

// Schedule Template Types
export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string | null;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  schedules: EmployeeSchedule[];
}

export interface ScheduleTemplateFormData {
  name: string;
  description?: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  isActive: boolean;
}

// Employee Schedule Types
export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  employee: Employee;
  templateId: string;
  template: ScheduleTemplate;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  notes?: string | null;
  status: ScheduleStatus;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  attendance?: Attendance | null;
}

export interface EmployeeScheduleFormData {
  employeeId: string;
  templateId: string;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  notes?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  employeeId: string;
  employee: Employee;
  scheduleId?: string | null;
  schedule?: EmployeeSchedule | null;
  attendanceDate: Date;
  clockInTime?: Date | null;
  clockOutTime?: Date | null;
  breakStartTime?: Date | null;
  breakEndTime?: Date | null;
  totalBreakMinutes: number;
  regularHours?: number | null;
  overtimeHours?: number | null;
  status: AttendanceStatus;
  locationIn?: string | null;
  locationOut?: string | null;
  ipAddress?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceFormData {
  employeeId: string;
  scheduleId?: string;
  attendanceDate: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalBreakMinutes: number;
  regularHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  locationIn?: string;
  locationOut?: string;
  ipAddress?: string;
  notes?: string;
}

export interface ClockInOutData {
  employeeId: string;
  location?: string;
  ipAddress?: string;
  notes?: string;
}

// Leave Management Types
export interface LeaveType {
  id: string;
  name: string;
  description?: string | null;
  daysPerYear: number;
  maxConsecutiveDays?: number | null;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  requests: LeaveRequest[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  leaveTypeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string | null;
  status: LeaveStatus;
  appliedDate: Date;
  approvedBy?: string | null;
  approvedByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequestFormData {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  notes?: string;
}

export interface EmployeeLeaveBalance {
  id: string;
  employeeId: string;
  employee: Employee;
  leaveTypeId: string;
  leaveType: LeaveType;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  balanceDays: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendancePolicy {
  id: string;
  name: string;
  description?: string | null;
  standardHours: number;
  graceMinutes: number;
  maxOvertimeHours: number;
  breakDeduction: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Search and Filter Types
export interface ScheduleSearchParams {
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ScheduleStatus;
  shiftType?: ShiftType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AttendanceSearchParams {
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LeaveRequestSearchParams {
  employeeId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Calendar and Report Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'schedule' | 'attendance' | 'leave' | 'holiday';
  employeeId?: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  status?: string;
  color?: string;
}

export interface AttendanceReport {
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: number;
  regularHours: number;
  attendancePercentage: number;
  dailyBreakdown: {
    date: Date;
    status: AttendanceStatus;
    clockIn?: Date;
    clockOut?: Date;
    hours?: number;
  }[];
}

export interface ScheduleReport {
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  scheduledShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  totalScheduledHours: number;
  totalWorkedHours: number;
  shiftBreakdown: {
    date: Date;
    shiftType: ShiftType;
    status: ScheduleStatus;
    startTime: Date;
    endTime: Date;
    hours: number;
  }[];
}

// API Input Types
export type CreateScheduleTemplateInput = {
  name: string;
  description?: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  isActive: boolean;
};

export type UpdateScheduleTemplateInput = Partial<CreateScheduleTemplateInput> & {
  id?: string;
};

export type CreateEmployeeScheduleInput = {
  employeeId: string;
  templateId: string;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  notes?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
};

export type UpdateEmployeeScheduleInput = Partial<CreateEmployeeScheduleInput> & {
  id?: string;
  status?: ScheduleStatus;
};

export type CreateAttendanceInput = {
  employeeId: string;
  scheduleId?: string;
  attendanceDate: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalBreakMinutes: number;
  regularHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  locationIn?: string;
  locationOut?: string;
  ipAddress?: string;
  notes?: string;
};

export type UpdateAttendanceInput = Partial<CreateAttendanceInput> & {
  id?: string;
};

export type CreateLeaveRequestInput = {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  notes?: string;
};

export type UpdateLeaveRequestInput = Partial<CreateLeaveRequestInput> & {
  id?: string;
  status?: LeaveStatus;
  rejectionReason?: string;
};

export type CreateLeaveTypeInput = {
  name: string;
  description?: string;
  daysPerYear: number;
  maxConsecutiveDays?: number;
  requiresApproval: boolean;
  isActive: boolean;
};

export type UpdateLeaveTypeInput = Partial<CreateLeaveTypeInput> & {
  id?: string;
};

export type CreateAttendancePolicyInput = {
  name: string;
  description?: string;
  standardHours: number;
  graceMinutes: number;
  maxOvertimeHours: number;
  breakDeduction: boolean;
  isActive: boolean;
};

export type UpdateAttendancePolicyInput = Partial<CreateAttendancePolicyInput> & {
  id?: string;
};

// Salary and Commission Types
export enum CalculationType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  TIERED = 'TIERED',
  HYBRID = 'HYBRID',
}

export enum PayPeriod {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum MetricType {
  ON_TIME_DELIVERY = 'ON_TIME_DELIVERY',
  QUALITY_SCORE = 'QUALITY_SCORE',
  CUSTOMER_SATISFACTION = 'CUSTOMER_SATISFACTION',
  PRODUCTIVITY = 'PRODUCTIVITY',
  ERROR_RATE = 'ERROR_RATE',
}

export enum PeriodType {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum BonusType {
  PERFORMANCE = 'PERFORMANCE',
  COMMISSION = 'COMMISSION',
  RETENTION = 'RETENTION',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
}

export enum BonusStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string | null;
  employeeId: string;
  employee: Employee;
  baseSalary: number;
  payPeriod: PayPeriod;
  standardHours: number;
  hourlyRate: number;
  overtimeRate: number;
  weekendRate: number;
  holidayRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  payrolls: Payroll[];
}

export interface CommissionRule {
  id: string;
  name: string;
  description?: string | null;
  orderType: OrderType;
  isActive: boolean;
  calculationType: CalculationType;
  basePercentage?: number | null;
  fixedAmount?: number | null;
  complexityMultiplierMin: number;
  complexityMultiplierMax: number;
  timeBonusEarly: number;
  timePenaltyDelay: number;
  qualityBonus: number;
  conditions?: any; // JSON
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  bonuses: Bonus[];
}

export interface PerformanceMetric {
  id: string;
  employeeId: string;
  employee: Employee;
  metricType: MetricType;
  value: number;
  targetValue: number;
  weight: number;
  period: string;
  periodType: PeriodType;
  calculatedAt: Date;
  notes?: string | null;
  bonuses: Bonus[];
}

export interface Bonus {
  id: string;
  employeeId: string;
  employee: Employee;
  commissionRuleId?: string | null;
  commissionRule?: CommissionRule | null;
  performanceMetricId?: string | null;
  performanceMetric?: PerformanceMetric | null;
  bonusType: BonusType;
  amount: number;
  currency: string;
  calculationBasis: any; // JSON
  performanceMetrics?: any; // JSON
  period: string;
  periodType: PeriodType;
  status: BonusStatus;
  approvedBy?: string | null;
  approvedByUser?: User | null;
  approvedAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee: Employee;
  salaryStructureId?: string | null;
  salaryStructure?: SalaryStructure | null;
  period: string;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
  baseSalary: number;
  overtimePay: number;
  commissionPay: number;
  bonusPay: number;
  totalEarnings: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  generatedAt: Date;
  approvedBy?: string | null;
  approvedByUser?: User | null;
  approvedAt?: Date | null;
  paidAt?: Date | null;
  calculationDetails: any; // JSON
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

// Form Data Types
export interface SalaryStructureFormData {
  name: string;
  description?: string;
  employeeId: string;
  baseSalary: number;
  payPeriod: PayPeriod;
  standardHours: number;
  overtimeRate: number;
  weekendRate: number;
  holidayRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
}

export interface CommissionRuleFormData {
  name: string;
  description?: string;
  orderType: OrderType;
  calculationType: CalculationType;
  basePercentage?: number;
  fixedAmount?: number;
  complexityMultiplierMin: number;
  complexityMultiplierMax: number;
  timeBonusEarly: number;
  timePenaltyDelay: number;
  qualityBonus: number;
  conditions?: any;
  isActive: boolean;
}

export interface PerformanceMetricFormData {
  employeeId: string;
  metricType: MetricType;
  value: number;
  targetValue: number;
  weight: number;
  period: string;
  periodType: PeriodType;
  notes?: string;
}

export interface BonusFormData {
  employeeId: string;
  commissionRuleId?: string;
  performanceMetricId?: string;
  bonusType: BonusType;
  amount: number;
  currency: string;
  calculationBasis: any;
  performanceMetrics?: any;
  period: string;
  periodType: PeriodType;
  status: BonusStatus;
}

export interface PayrollFormData {
  employeeId: string;
  salaryStructureId?: string;
  period: string;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
  baseSalary: number;
  overtimePay: number;
  commissionPay: number;
  bonusPay: number;
  totalEarnings: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  calculationDetails: any;
}

// Search and Filter Types
export interface SalaryStructureSearchParams {
  employeeId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CommissionRuleSearchParams {
  orderType?: OrderType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PerformanceMetricSearchParams {
  employeeId?: string;
  metricType?: MetricType;
  period?: string;
  periodType?: PeriodType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BonusSearchParams {
  employeeId?: string;
  bonusType?: BonusType;
  status?: BonusStatus;
  period?: string;
  periodType?: PeriodType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PayrollSearchParams {
  employeeId?: string;
  period?: string;
  periodType?: PeriodType;
  status?: PayrollStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Input Types
export type CreateSalaryStructureInput = {
  name: string;
  description?: string;
  employeeId: string;
  baseSalary: number;
  payPeriod: PayPeriod;
  standardHours: number;
  overtimeRate: number;
  weekendRate: number;
  holidayRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
};

export type UpdateSalaryStructureInput = Partial<CreateSalaryStructureInput> & {
  id?: string;
};

export type CreateCommissionRuleInput = {
  name: string;
  description?: string;
  orderType: OrderType;
  calculationType: CalculationType;
  basePercentage?: number;
  fixedAmount?: number;
  complexityMultiplierMin: number;
  complexityMultiplierMax: number;
  timeBonusEarly: number;
  timePenaltyDelay: number;
  qualityBonus: number;
  conditions?: any;
  isActive: boolean;
};

export type UpdateCommissionRuleInput = Partial<CreateCommissionRuleInput> & {
  id?: string;
};

export type CreatePerformanceMetricInput = {
  employeeId: string;
  metricType: MetricType;
  value: number;
  targetValue: number;
  weight: number;
  period: string;
  periodType: PeriodType;
  notes?: string;
};

export type UpdatePerformanceMetricInput = Partial<CreatePerformanceMetricInput> & {
  id?: string;
};

export type CreateBonusInput = {
  employeeId: string;
  commissionRuleId?: string;
  performanceMetricId?: string;
  bonusType: BonusType;
  amount: number;
  currency: string;
  calculationBasis: any;
  performanceMetrics?: any;
  period: string;
  periodType: PeriodType;
  status: BonusStatus;
};

export type UpdateBonusInput = Partial<CreateBonusInput> & {
  id?: string;
};

export type CreatePayrollInput = {
  employeeId: string;
  salaryStructureId?: string;
  period: string;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
  baseSalary: number;
  overtimePay: number;
  commissionPay: number;
  bonusPay: number;
  totalEarnings: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  calculationDetails: any;
};

export type UpdatePayrollInput = Partial<CreatePayrollInput> & {
  id?: string;
};

export enum TaxType {
  INCOME_TAX = 'INCOME_TAX',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  MEDICAL_INSURANCE = 'MEDICAL_INSURANCE',
  PENSION = 'PENSION',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// Inventory Types
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category: InventoryCategory;
  unit?: string | null;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number | null;
  unitPrice?: number | null;
  currency: string;
  supplierName?: string | null;
  supplierContact?: string | null;
  specifications?: any; // JSON
  imageUrls: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  updatedBy?: string | null;
  updatedByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  transactions: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  inventoryItem: InventoryItem;
  type: InventoryTransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitPrice?: number | null;
  totalValue?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: Date;
  createdBy?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface InventoryItemFormData {
  sku: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  unit?: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unitPrice?: number;
  currency: string;
  supplierName?: string;
  supplierContact?: string;
  specifications?: any;
  imageUrls: string[];
  isActive: boolean;
}

export interface InventorySearchParams {
  search?: string;
  category?: InventoryCategory;
  lowStock?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// New Supplier Management Types
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum WasteReason {
  CUTTING_LOSS = 'CUTTING_LOSS',
  STITCHING_ERROR = 'STITCHING_ERROR',
  QUALITY_REJECT = 'QUALITY_REJECT',
  EXCESS_MATERIAL = 'EXCESS_MATERIAL',
  DAMAGED_GOODS = 'DAMAGED_GOODS',
  OTHER = 'OTHER',
}

export enum PaymentTerms {
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  ADVANCE_PAYMENT = 'ADVANCE_PAYMENT',
}

export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  email: string | null;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  paymentTerms: PaymentTerms;
  leadTimeDays: number;
  minimumOrder: number | null;
  notes: string | null;
  status: SupplierStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  inventoryItems: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  payments: SupplierPayment[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  orderDate: Date;
  expectedDate: Date | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  currency: string;
  notes: string | null;
  approvedBy: string | null;
  approvedByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  items: PurchaseOrderItem[];
  receipts: InventoryTransaction[];
  payments: SupplierPayment[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrder;
  inventoryItemId: string;
  inventoryItem: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  notes: string | null;
}

export interface MaterialUsage {
  id: string;
  orderId: string;
  order: Order;
  inventoryItemId: string;
  inventoryItem: InventoryItem;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  usageDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface Waste {
  id: string;
  inventoryItemId: string;
  inventoryItem: InventoryItem;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: WasteReason;
  description: string | null;
  wasteDate: Date;
  orderId: string | null;
  order: Order | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplier: Supplier;
  purchaseOrderId: string | null;
  purchaseOrder: PurchaseOrder | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDate: Date | null;
  dueDate: Date;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  processedBy: string | null;
  processedByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  processedAt: Date | null;
}

// Form Data Types
export interface SupplierFormData {
  supplierNumber: string;
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  paymentTerms: PaymentTerms;
  leadTimeDays: number;
  minimumOrder?: number;
  notes?: string;
  status: SupplierStatus;
  isActive: boolean;
}

export interface PurchaseOrderFormData {
  supplierId: string;
  expectedDate?: Date;
  notes?: string;
  items: {
    inventoryItemId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
}

export interface MaterialUsageFormData {
  orderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface WasteFormData {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  reason: WasteReason;
  description?: string;
  orderId?: string;
}

export interface SupplierPaymentFormData {
  supplierId: string;
  purchaseOrderId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  dueDate: Date;
  reference?: string;
  notes?: string;
}

// Search and Filter Types
export interface SupplierSearchParams {
  search?: string;
  status?: SupplierStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PurchaseOrderSearchParams {
  search?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MaterialUsageSearchParams {
  orderId?: string;
  inventoryItemId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface WasteSearchParams {
  inventoryItemId?: string;
  reason?: WasteReason;
  orderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SupplierPaymentSearchParams {
  supplierId?: string;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Financial Management Enums
export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum ExpenseCategoryType {
  MATERIALS = 'MATERIALS',
  SALARIES = 'SALARIES',
  UTILITIES = 'UTILITIES',
  RENT = 'RENT',
  MARKETING = 'MARKETING',
  EQUIPMENT = 'EQUIPMENT',
  MAINTENANCE = 'MAINTENANCE',
  INSURANCE = 'INSURANCE',
  TAXES = 'TAXES',
  OTHER = 'OTHER',
}

export enum FinancialPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}
