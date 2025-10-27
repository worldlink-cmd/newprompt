import { Task, TaskSearchParams, CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, AssignTaskInput } from '../../types';
import { Employee } from '../../types';

const API_BASE = '/api/tasks';

// Fetch tasks with filters
export async function fetchTasks(params: TaskSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append('search', params.search);
  if (params.orderId) searchParams.append('orderId', params.orderId);
  if (params.stage) searchParams.append('stage', params.stage);
  if (params.assignedEmployeeId) searchParams.append('assignedEmployeeId', params.assignedEmployeeId);
  if (params.status) searchParams.append('status', params.status);
  if (params.priority) searchParams.append('priority', params.priority);
  if (params.overdue) searchParams.append('overdue', 'true');
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
}

// Fetch a single task
export async function fetchTask(id: string) {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }

  return response.json();
}

// Create a new task
export async function createTask(data: CreateTaskInput) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
}

// Update a task
export async function updateTask(id: string, data: UpdateTaskInput) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }

  return response.json();
}

// Delete a task
export async function deleteTask(id: string) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }

  return response.json();
}

// Update task status
export async function updateTaskStatus(id: string, data: UpdateTaskStatusInput) {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task status');
  }

  return response.json();
}

// Assign task to employee
export async function assignTask(data: AssignTaskInput) {
  const response = await fetch(`${API_BASE}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign task');
  }

  return response.json();
}

// Fetch workload data for visualization
export async function fetchWorkloadData() {
  const response = await fetch(`${API_BASE}/workload`);

  if (!response.ok) {
    throw new Error(`Failed to fetch workload data: ${response.statusText}`);
  }

  return response.json();
}

// Skill-based routing: Find best employee for a task
export async function findBestEmployeeForTask(task: any): Promise<Employee | null> {
  try {
    // Get all employees and their current workloads
    const employeesResponse = await fetch('/api/employees');
    if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
    const employeesData = await employeesResponse.json();
    const employees = employeesData.employees as Employee[];

    // Get workload data
    const workloadData = await fetchWorkloadData();

    // Calculate scores for each employee
    const employeeScores = employees.map(employee => {
      const workload = workloadData.find((w: any) => w.employeeId === employee.id);
      const activeTasks = workload?.activeTasks || 0;
      const capacity = workload?.capacity || 1;

      // Base score: Available capacity
      let score = Math.max(0, capacity - activeTasks);

      // Skill matching bonus
      if (task.requiredSkills && employee.skills) {
        const matchingSkills = task.requiredSkills.filter((skill: string) =>
          employee.skills.some((sl: any) => sl.skill && sl.skill.name === skill)
        );
        score += matchingSkills.length * 2; // Boost for each matching skill
      }

      // Priority boost for high priority tasks
      if (task.priority === 'HIGH') {
        score *= 1.5;
      }

      // Stage specialization bonus
      if (employee.specializations?.includes(task.stage)) {
        score *= 1.2;
      }

      return {
        employee,
        score,
        workload: activeTasks,
        capacity
      };
    });

    // Sort by score (descending) and return best employee
    employeeScores.sort((a, b) => b.score - a.score);

    return employeeScores.length > 0 ? employeeScores[0].employee : null;
  } catch (error) {
    console.error('Error finding best employee for task:', error);
    return null;
  }
}

// Auto-assign task using skill-based routing
export async function autoAssignTask(taskId: string) {
  try {
    // Get task details
    const taskResponse = await fetchTask(taskId);
    const task = taskResponse.task;

    if (!task) {
      throw new Error('Task not found');
    }

    // Find best employee
    const bestEmployee = await findBestEmployeeForTask({
      stage: task.stage,
      priority: task.priority,
      requiredSkills: task.requiredSkills || []
    });

    if (!bestEmployee) {
      return {
        success: false,
        message: 'No suitable employee found for this task'
      };
    }

    // Assign the task
    const assignResult = await assignTask({
      taskId,
      employeeId: bestEmployee.id
    });

    return {
      success: true,
      assignedEmployee: bestEmployee,
      message: `Task assigned to ${bestEmployee.name}`
    };
  } catch (error) {
    console.error('Error auto-assigning task:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to auto-assign task'
    };
  }
}

// Update order status based on task completion
export async function updateOrderStatusFromTasks(orderId: string) {
  try {
    // Get all tasks for the order
    const tasksResponse = await fetchTasks({ orderId, limit: 100 });
    const tasks = tasksResponse.tasks;

    if (tasks.length === 0) {
      return { success: false, message: 'No tasks found for this order' };
    }

    // Check if all tasks are completed
    const allCompleted = tasks.every(task => task.status === 'COMPLETED');
    const hasInProgress = tasks.some(task => task.status === 'IN_PROGRESS');
    const hasPending = tasks.some(task => task.status === 'PENDING');

    let newOrderStatus = 'RECEIVED'; // Default

    if (allCompleted) {
      newOrderStatus = 'READY';
    } else if (hasInProgress) {
      // Find the highest stage in progress
      const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
      const highestStage = inProgressTasks.length > 0 ?
        Math.max(...inProgressTasks.map(task => getStageOrder(task.stage))) :
        0;
      newOrderStatus = getOrderStatusFromStage(highestStage);
    } else if (hasPending) {
      // Find the earliest pending stage
      const pendingTasks = tasks.filter(task => task.status === 'PENDING');
      const earliestStage = pendingTasks.length > 0 ?
        Math.min(...pendingTasks.map(task => getStageOrder(task.stage))) :
        0;
      newOrderStatus = getOrderStatusFromStage(earliestStage);
    }

    // Update order status if it has changed
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newOrderStatus,
        notes: `Status updated automatically based on task completion`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return {
      success: true,
      message: `Order status updated to ${newOrderStatus}`,
      newStatus: newOrderStatus
    };

  } catch (error) {
    console.error('Error updating order status from tasks:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update order status'
    };
  }
}

// Helper function to get stage order
function getStageOrder(stage: string): number {
  const stageOrder: Record<string, number> = {
    RECEIVED: 1,
    CUTTING: 2,
    STITCHING: 3,
    QUALITY_CHECK: 4,
    PRESSING: 5,
    READY: 6,
    DELIVERED: 7,
    CANCELLED: 0,
  };
  return stageOrder[stage] || 0;
}

// Helper function to get order status from stage
function getOrderStatusFromStage(stageOrder: number): string {
  const statusMap: Record<number, string> = {
    1: 'RECEIVED',
    2: 'CUTTING',
    3: 'STITCHING',
    4: 'QUALITY_CHECK',
    5: 'PRESSING',
    6: 'READY',
    7: 'DELIVERED',
  };
  return statusMap[stageOrder] || 'RECEIVED';
}
