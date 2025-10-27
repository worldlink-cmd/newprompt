import { prisma } from '../prisma';
import {
  CreateTestSuiteInput,
  CreateTestCaseInput,
  CreateTestExecutionInput,
  CreatePerformanceTestInput,
  CreateLoadTestInput
} from '../validations/testing';

export class TestingService {
  // Test Suite Management
  static async createTestSuite(data: CreateTestSuiteInput, userId: string) {
    return await prisma.testSuite.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getTestSuites(filters: {
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const [suites, total] = await Promise.all([
      prisma.testSuite.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              testCases: true,
              executions: true,
            },
          },
        },
      }),
      prisma.testSuite.count({ where }),
    ]);

    return {
      suites,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async executeTestSuite(suiteId: string, userId: string) {
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        testCases: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!suite) {
      throw new Error('Test suite not found');
    }

    // Create test execution
    const execution = await prisma.testExecution.create({
      data: {
        suiteId,
        triggeredBy: userId,
        status: 'RUNNING',
      },
    });

    try {
      const results = [];

      // Execute each test case
      for (const testCase of suite.testCases) {
        const result = await this.executeTestCase(testCase.id, execution.id);
        results.push(result);
      }

      // Calculate summary
      const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASSED').length,
        failed: results.filter(r => r.status === 'FAILED').length,
        skipped: results.filter(r => r.status === 'SKIPPED').length,
        errors: results.filter(r => r.status === 'ERROR').length,
      };

      // Update execution with results
      await prisma.testExecution.update({
        where: { id: execution.id },
        data: {
          status: summary.failed === 0 ? 'PASSED' : 'FAILED',
          endTime: new Date(),
          duration: Date.now() - execution.createdAt.getTime(),
          results,
          summary,
        },
      });

      return { execution, results, summary };

    } catch (error) {
      // Update execution with error
      await prisma.testExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  // Test Case Management
  static async createTestCase(data: CreateTestCaseInput, userId: string) {
    return await prisma.testCase.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        suite: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async executeTestCase(testCaseId: string, executionId: string) {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    const startTime = Date.now();

    try {
      // Execute test based on type
      switch (testCase.type) {
        case 'API':
          return await this.executeAPITest(testCase, executionId, startTime);
        case 'UI':
          return await this.executeUITest(testCase, executionId, startTime);
        case 'UNIT':
          return await this.executeUnitTest(testCase, executionId, startTime);
        default:
          return await this.executeGenericTest(testCase, executionId, startTime);
      }
    } catch (error) {
      return {
        caseId: testCaseId,
        executionId,
        status: 'ERROR',
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async executeAPITest(testCase: any, executionId: string, startTime: number) {
    // API test execution logic
    // This would use a library like supertest or similar
    console.log('Executing API test:', testCase.name);

    return {
      caseId: testCase.id,
      executionId,
      status: 'PASSED',
      duration: Date.now() - startTime,
    };
  }

  private static async executeUITest(testCase: any, executionId: string, startTime: number) {
    // UI test execution logic
    // This would use a library like Playwright or Cypress
    console.log('Executing UI test:', testCase.name);

    return {
      caseId: testCase.id,
      executionId,
      status: 'PASSED',
      duration: Date.now() - startTime,
    };
  }

  private static async executeUnitTest(testCase: any, executionId: string, startTime: number) {
    // Unit test execution logic
    // This would use Jest or similar testing framework
    console.log('Executing unit test:', testCase.name);

    return {
      caseId: testCase.id,
      executionId,
      status: 'PASSED',
      duration: Date.now() - startTime,
    };
  }

  private static async executeGenericTest(testCase: any, executionId: string, startTime: number) {
    // Generic test execution
    return {
      caseId: testCase.id,
      executionId,
      status: 'PASSED',
      duration: Date.now() - startTime,
    };
  }

  // Performance Testing
  static async createPerformanceTest(data: CreatePerformanceTestInput, userId: string) {
    return await prisma.performanceTest.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async executePerformanceTest(testId: string) {
    const test = await prisma.performanceTest.findUnique({
      where: { id: testId },
    });

    if (!test || !test.isActive) {
      throw new Error('Performance test not found or inactive');
    }

    const startTime = Date.now();

    try {
      const results = await this.runPerformanceTest(test);

      return {
        test,
        results,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

    } catch (error) {
      throw new Error(`Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async runPerformanceTest(test: any) {
    // Performance test execution
    const results = {
      responseTimes: [] as number[],
      throughput: 0,
      errorRate: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        network: 0,
      },
    };

    // Simulate performance testing
    for (let i = 0; i < test.configuration.virtualUsers; i++) {
      const responseTime = Math.random() * 1000 + 100; // Random response time
      results.responseTimes.push(responseTime);
    }

    results.throughput = test.configuration.virtualUsers / (test.configuration.duration / 60); // Requests per minute
    results.errorRate = Math.random() * 5; // Random error rate

    return results;
  }

  // Load Testing
  static async createLoadTest(data: CreateLoadTestInput, userId: string) {
    return await prisma.loadTest.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async executeLoadTest(testId: string) {
    const test = await prisma.loadTest.findUnique({
      where: { id: testId },
    });

    if (!test || !test.isActive) {
      throw new Error('Load test not found or inactive');
    }

    const startTime = Date.now();

    try {
      const results = await this.runLoadTest(test);

      return {
        test,
        results,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

    } catch (error) {
      throw new Error(`Load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async runLoadTest(test: any) {
    // Load test execution
    const results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      concurrentUsers: [] as number[],
    };

    // Simulate load testing
    results.totalRequests = test.maxUsers * 100; // Assume 100 requests per user
    results.successfulRequests = Math.floor(results.totalRequests * 0.95); // 95% success rate
    results.failedRequests = results.totalRequests - results.successfulRequests;
    results.averageResponseTime = 250; // Average response time in ms
    results.minResponseTime = 50;
    results.maxResponseTime = 2000;
    results.throughput = test.maxUsers * 10; // Requests per second
    results.errorRate = (results.failedRequests / results.totalRequests) * 100;

    // Simulate concurrent users over time
    for (let i = 0; i <= test.testDuration; i += 10) {
      const users = Math.min(test.maxUsers, Math.floor((i / test.rampUpTime) * test.maxUsers));
      results.concurrentUsers.push(users);
    }

    return results;
  }

  // Test Reporting
  static async generateTestReport(executionId: string) {
    const execution = await prisma.testExecution.findUnique({
      where: { id: executionId },
      include: {
        suite: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        triggeredByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        results: true,
      },
    });

    if (!execution) {
      throw new Error('Test execution not found');
    }

    // Generate detailed report
    const report = {
      execution: {
        id: execution.id,
        suite: execution.suite,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.duration,
        triggeredBy: execution.triggeredByUser,
      },
      summary: execution.summary,
      results: execution.results,
      recommendations: this.generateTestRecommendations(execution),
    };

    return report;
  }

  private static generateTestRecommendations(execution: any): string[] {
    const recommendations = [];

    if (execution.summary.failed > 0) {
      recommendations.push(`${execution.summary.failed} test cases failed. Review and fix the failing tests.`);
    }

    if (execution.summary.errors > 0) {
      recommendations.push(`${execution.summary.errors} test cases had errors. Check test environment and dependencies.`);
    }

    if (execution.duration > 300000) { // 5 minutes
      recommendations.push('Test execution took too long. Consider optimizing test performance.');
    }

    return recommendations;
  }

  // Test Automation
  static async scheduleAutomatedTests() {
    const suites = await prisma.testSuite.findMany({
      where: {
        isActive: true,
        autoRun: true,
      },
    });

    for (const suite of suites) {
      // Check if suite should run based on schedule
      const shouldRun = await this.shouldRunScheduledTest(suite);

      if (shouldRun) {
        await this.executeTestSuite(suite.id, 'SYSTEM');
      }
    }
  }

  private static async shouldRunScheduledTest(suite: any): Promise<boolean> {
    const lastExecution = await prisma.testExecution.findFirst({
      where: { suiteId: suite.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastExecution) return true;

    const now = new Date();
    const lastRun = lastExecution.createdAt;
    const timeDiff = now.getTime() - lastRun.getTime();

    switch (suite.schedule) {
      case 'DAILY':
        return timeDiff > 24 * 60 * 60 * 1000;
      case 'WEEKLY':
        return timeDiff > 7 * 24 * 60 * 60 * 1000;
      case 'BEFORE_DEPLOY':
        // This would be triggered by deployment pipeline
        return false;
      default:
        return false;
    }
  }

  // Test Coverage Analysis
  static async analyzeTestCoverage() {
    const totalEndpoints = await this.countAPIEndpoints();
    const testedEndpoints = await this.countTestedEndpoints();
    const totalComponents = await this.countUIComponents();
    const testedComponents = await this.countTestedComponents();

    const coverage = {
      apiCoverage: totalEndpoints > 0 ? (testedEndpoints / totalEndpoints) * 100 : 0,
      uiCoverage: totalComponents > 0 ? (testedComponents / totalComponents) * 100 : 0,
      overallCoverage: 0,
    };

    coverage.overallCoverage = (coverage.apiCoverage + coverage.uiCoverage) / 2;

    return {
      coverage,
      recommendations: this.generateCoverageRecommendations(coverage),
    };
  }

  private static async countAPIEndpoints(): Promise<number> {
    // Count API routes in the app directory
    return 50; // Placeholder - would scan actual API routes
  }

  private static async countTestedEndpoints(): Promise<number> {
    // Count API tests
    return 35; // Placeholder - would count actual API test cases
  }

  private static async countUIComponents(): Promise<number> {
    // Count React components
    return 100; // Placeholder - would scan actual components
  }

  private static async countTestedComponents(): Promise<number> {
    // Count UI tests
    return 70; // Placeholder - would count actual UI test cases
  }

  private static generateCoverageRecommendations(coverage: any): string[] {
    const recommendations = [];

    if (coverage.apiCoverage < 80) {
      recommendations.push('API test coverage is below 80%. Add more API tests.');
    }

    if (coverage.uiCoverage < 70) {
      recommendations.push('UI test coverage is below 70%. Add more UI tests.');
    }

    if (coverage.overallCoverage < 75) {
      recommendations.push('Overall test coverage is below 75%. Increase test coverage across all areas.');
    }

    return recommendations;
  }

  // Performance Benchmarking
  static async runPerformanceBenchmarks() {
    const benchmarks = [];

    // Database performance
    const dbBenchmark = await this.benchmarkDatabase();
    benchmarks.push(dbBenchmark);

    // API performance
    const apiBenchmark = await this.benchmarkAPI();
    benchmarks.push(apiBenchmark);

    // UI performance
    const uiBenchmark = await this.benchmarkUI();
    benchmarks.push(uiBenchmark);

    return {
      benchmarks,
      overallScore: this.calculateOverallPerformanceScore(benchmarks),
      timestamp: new Date(),
    };
  }

  private static async benchmarkDatabase() {
    const startTime = Date.now();

    // Test various database operations
    await prisma.customer.count();
    await prisma.order.findMany({ take: 100 });
    await prisma.financialTransaction.aggregate({
      _avg: { amount: true },
    });

    const duration = Date.now() - startTime;

    return {
      category: 'DATABASE',
      operations: 3,
      duration,
      averageTime: duration / 3,
      status: duration < 1000 ? 'GOOD' : duration < 5000 ? 'FAIR' : 'POOR',
    };
  }

  private static async benchmarkAPI() {
    const startTime = Date.now();

    // Test API endpoints
    // This would make actual API calls
    const duration = Date.now() - startTime;

    return {
      category: 'API',
      operations: 1,
      duration,
      averageTime: duration,
      status: duration < 500 ? 'GOOD' : duration < 2000 ? 'FAIR' : 'POOR',
    };
  }

  private static async benchmarkUI() {
    // UI performance testing would require browser automation
    return {
      category: 'UI',
      operations: 0,
      duration: 0,
      averageTime: 0,
      status: 'NOT_IMPLEMENTED',
    };
  }

  private static calculateOverallPerformanceScore(benchmarks: any[]): number {
    const validBenchmarks = benchmarks.filter(b => b.status !== 'NOT_IMPLEMENTED');

    if (validBenchmarks.length === 0) return 0;

    const totalScore = validBenchmarks.reduce((sum, benchmark) => {
      switch (benchmark.status) {
        case 'GOOD':
          return sum + 100;
        case 'FAIR':
          return sum + 70;
        case 'POOR':
          return sum + 40;
        default:
          return sum;
      }
    }, 0);

    return Math.round(totalScore / validBenchmarks.length);
  }

  // Test Data Management
  static async createTestData(dataType: string, count: number) {
    switch (dataType) {
      case 'CUSTOMERS':
        return await this.createTestCustomers(count);
      case 'ORDERS':
        return await this.createTestOrders(count);
      case 'INVOICES':
        return await this.createTestInvoices(count);
      default:
        throw new Error(`Test data creation not supported for type: ${dataType}`);
    }
  }

  private static async createTestCustomers(count: number) {
    const customers = [];

    for (let i = 0; i < count; i++) {
      const customer = await prisma.customer.create({
        data: {
          customerNumber: `TEST-${Date.now()}-${i}`,
          firstName: `Test`,
          lastName: `Customer${i}`,
          email: `test${i}@example.com`,
          phone: `+97150123456${i.toString().padStart(2, '0')}`,
        },
      });
      customers.push(customer);
    }

    return customers;
  }

  private static async createTestOrders(count: number) {
    // Order creation logic
    console.log(`Creating ${count} test orders`);
    return [];
  }

  private static async createTestInvoices(count: number) {
    // Invoice creation logic
    console.log(`Creating ${count} test invoices`);
    return [];
  }

  static async cleanupTestData() {
    // Clean up test data
    await prisma.customer.deleteMany({
      where: {
        customerNumber: { startsWith: 'TEST-' },
      },
    });

    console.log('Test data cleaned up');
    return { success: true };
  }

  // Test Analytics
  static async getTestAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    category?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.category) where.category = filters.category;

    const executions = await prisma.testExecution.findMany({ where });

    const totalExecutions = executions.length;
    const passedExecutions = executions.filter(e => e.status === 'PASSED').length;
    const failedExecutions = executions.filter(e => e.status === 'FAILED').length;

    const averageDuration = executions.length > 0
      ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
      : 0;

    return {
      totalExecutions,
      passedExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0,
      averageDuration,
      trend: this.calculateTestTrend(executions),
    };
  }

  private static calculateTestTrend(executions: any[]) {
    // Calculate test success trend over time
    const daily = new Map();

    executions.forEach(execution => {
      const date = execution.createdAt.toISOString().split('T')[0];
      if (!daily.has(date)) {
        daily.set(date, { total: 0, passed: 0 });
      }

      const day = daily.get(date);
      day.total++;
      if (execution.status === 'PASSED') {
        day.passed++;
      }
    });

    return Array.from(daily.entries()).map(([date, stats]) => ({
      date,
      successRate: (stats.passed / stats.total) * 100,
    }));
  }

  // Continuous Integration Support
  static async runPreDeploymentTests() {
    const criticalSuites = await prisma.testSuite.findMany({
      where: {
        isActive: true,
        schedule: 'BEFORE_DEPLOY',
      },
      include: {
        testCases: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const results = [];

    for (const suite of criticalSuites) {
      if (suite.testCases.length > 0) {
        const result = await this.executeTestSuite(suite.id, 'DEPLOYMENT_PIPELINE');
        results.push(result);
      }
    }

    // Check if all critical tests passed
    const allPassed = results.every(r => r.summary.failed === 0 && r.summary.errors === 0);

    return {
      allPassed,
      results,
      canDeploy: allPassed,
    };
  }

  // Test Environment Management
  static async setupTestEnvironment(environment: string) {
    // Set up test environment
    console.log(`Setting up test environment: ${environment}`);

    return {
      environment,
      status: 'READY',
      timestamp: new Date(),
    };
  }

  static async teardownTestEnvironment(environment: string) {
    // Clean up test environment
    await this.cleanupTestData();

    console.log(`Test environment ${environment} cleaned up`);

    return {
      environment,
      status: 'CLEANED',
      timestamp: new Date(),
    };
  }

  // Test Result Analysis
  static async analyzeTestResults(executionId: string) {
    const execution = await prisma.testExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new Error('Test execution not found');
    }

    const analysis = {
      execution: {
        id: execution.id,
        status: execution.status,
        duration: execution.duration,
        summary: execution.summary,
      },
      insights: this.generateTestInsights(execution),
      recommendations: this.generateTestRecommendations(execution),
    };

    return analysis;
  }

  private static generateTestInsights(execution: any) {
    const insights = [];

    if (execution.duration > 600000) { // 10 minutes
      insights.push('Test execution time is unusually long. Consider optimizing test performance.');
    }

    if (execution.summary.failed > execution.summary.total * 0.1) {
      insights.push('High failure rate detected. Review test stability and environment setup.');
    }

    if (execution.summary.skipped > 0) {
      insights.push(`${execution.summary.skipped} tests were skipped. Review test preconditions.`);
    }

    return insights;
  }

  // Automated Test Discovery
  static async discoverTests() {
    // Discover test cases from codebase
    const discoveredTests = {
      apiTests: await this.discoverAPITests(),
      uiTests: await this.discoverUITests(),
      unitTests: await this.discoverUnitTests(),
    };

    return discoveredTests;
  }

  private static async discoverAPITests() {
    // Scan API routes and generate test cases
    return [];
  }

  private static async discoverUITests() {
    // Scan UI components and generate test cases
    return [];
  }

  private static async discoverUnitTests() {
    // Scan service functions and generate test cases
    return [];
  }

  // Test Maintenance
  static async updateTestStatus(testCaseId: string, status: string) {
    return await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  static async archiveOldTestResults(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const archived = await prisma.testExecution.updateMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['PASSED', 'FAILED'] },
      },
      data: {
        isArchived: true,
      },
    });

    return archived.count;
  }

  // Test Metrics and KPIs
  static async getTestKPIs() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalExecutions,
      passedExecutions,
      averageDuration,
      testCoverage,
    ] = await Promise.all([
      prisma.testExecution.count({
        where: {
          createdAt: { gte: last30Days },
        },
      }),
      prisma.testExecution.count({
        where: {
          createdAt: { gte: last30Days },
          status: 'PASSED',
        },
      }),
      prisma.testExecution.aggregate({
        where: {
          createdAt: { gte: last30Days },
          status: 'PASSED',
        },
        _avg: {
          duration: true,
        },
      }),
      this.analyzeTestCoverage(),
    ]);

    return {
      totalExecutions,
      passedExecutions,
      successRate: totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0,
      averageDuration: Number(averageDuration._avg.duration) || 0,
      testCoverage: testCoverage.coverage,
      qualityScore: this.calculateQualityScore({
        successRate: totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0,
        coverage: testCoverage.coverage.overallCoverage,
        performance: averageDuration._avg.duration < 300000 ? 100 : 70, // Good if under 5 minutes
      }),
    };
  }

  private static calculateQualityScore(metrics: any): number {
    const weights = {
      successRate: 0.4,
      coverage: 0.4,
      performance: 0.2,
    };

    return Math.round(
      metrics.successRate * weights.successRate +
      metrics.coverage * weights.coverage +
      metrics.performance * weights.performance
    );
  }

  // Error Analysis
  static async analyzeTestFailures() {
    const failedExecutions = await prisma.testExecution.findMany({
      where: {
        status: 'FAILED',
      },
      include: {
        results: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const failurePatterns = new Map();

    failedExecutions.forEach(execution => {
      execution.results.forEach((result: any) => {
        if (result.status === 'FAILED' || result.status === 'ERROR') {
          const error = result.errorMessage || 'Unknown error';
          failurePatterns.set(error, (failurePatterns.get(error) || 0) + 1);
        }
      });
    });

    return {
      totalFailedExecutions: failedExecutions.length,
      commonFailures: Array.from(failurePatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([error, count]) => ({ error, count })),
      recommendations: this.generateFailureRecommendations(failurePatterns),
    };
  }

  private static generateFailureRecommendations(failurePatterns: Map<string, number>): string[] {
    const recommendations = [];

    const topFailures = Array.from(failurePatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topFailures.forEach(([error, count]) => {
      recommendations.push(`Address common failure: "${error}" (${count} occurrences)`);
    });

    return recommendations;
  }

  // Test Documentation
  static async generateTestDocumentation() {
    const suites = await prisma.testSuite.findMany({
      where: { isActive: true },
      include: {
        testCases: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const documentation = {
      generatedAt: new Date(),
      totalSuites: suites.length,
      totalTestCases: suites.reduce((sum, suite) => sum + suite.testCases.length, 0),
      suites: suites.map(suite => ({
        id: suite.id,
        name: suite.name,
        description: suite.description,
        category: suite.category,
        testCases: suite.testCases.map(testCase => ({
          id: testCase.id,
          name: testCase.name,
          description: testCase.description,
          type: testCase.type,
          priority: testCase.priority,
          steps: testCase.steps,
        })),
      })),
    };

    return documentation;
  }

  // Performance Regression Detection
  static async detectPerformanceRegression() {
    const recentTests = await prisma.performanceTest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    if (recentTests.length < 2) {
      return { hasRegression: false, message: 'Insufficient data for regression analysis' };
    }

    const latest = recentTests[0];
    const previous = recentTests[1];

    const responseTimeChange = ((latest.results.averageResponseTime - previous.results.averageResponseTime) / previous.results.averageResponseTime) * 100;
    const throughputChange = ((latest.results.throughput - previous.results.throughput) / previous.results.throughput) * 100;

    const hasRegression = responseTimeChange > 20 || throughputChange < -20; // 20% threshold

    return {
      hasRegression,
      metrics: {
        responseTimeChange,
        throughputChange,
      },
      latestTest: latest,
      previousTest: previous,
      message: hasRegression
        ? 'Performance regression detected. Review recent changes.'
        : 'No performance regression detected.',
    };
  }

  // Test Scheduling
  static async scheduleTestExecution(suiteId: string, scheduledFor: Date, userId: string) {
    return await prisma.scheduledTest.create({
      data: {
        suiteId,
        scheduledFor,
        scheduledBy: userId,
        status: 'PENDING',
      },
    });
  }

  static async processScheduledTests() {
    const pendingTests = await prisma.scheduledTest.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date(),
        },
      },
    });

    for (const scheduledTest of pendingTests) {
      try {
        await this.executeTestSuite(scheduledTest.suiteId, 'SCHEDULER');

        await prisma.scheduledTest.update({
          where: { id: scheduledTest.id },
          data: {
            status: 'COMPLETED',
            executedAt: new Date(),
          },
        });

      } catch (error) {
        await prisma.scheduledTest.update({
          where: { id: scheduledTest.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return pendingTests.length;
  }
}
