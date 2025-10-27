import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { prisma } from '../prisma';
import { format } from 'date-fns';

export interface PayslipData {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  period: string;
  periodType: string;
  payDate: Date;
  baseSalary: number;
  overtimePay: number;
  commissionPay: number;
  bonusPay: number;
  totalEarnings: number;
  taxDeductions: number;
  otherDeductions: number;
  netPay: number;
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
}

export class PayslipGenerator {
  static async generatePayslipPDF(payrollId: string): Promise<Buffer> {
    // Get payroll data with employee details
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    if (!payroll) {
      throw new Error('Payroll not found');
    }

    const payslipData: PayslipData = {
      employeeId: payroll.employee.id,
      employeeName: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
      employeeNumber: payroll.employee.employeeNumber,
      period: payroll.period,
      periodType: payroll.periodType,
      payDate: new Date(),
      baseSalary: payroll.baseSalary,
      overtimePay: payroll.overtimePay,
      commissionPay: payroll.commissionPay,
      bonusPay: payroll.bonusPay,
      totalEarnings: payroll.totalEarnings,
      taxDeductions: payroll.taxDeductions,
      otherDeductions: payroll.otherDeductions,
      netPay: payroll.netPay,
      companyName: 'Tailoring Business Management',
      companyAddress: 'Dubai, UAE',
    };

    return this.createPayslipPDF(payslipData);
  }

  static async generatePayslipHTML(payrollId: string): Promise<string> {
    // Get payroll data
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    if (!payroll) {
      throw new Error('Payroll not found');
    }

    const payslipData: PayslipData = {
      employeeId: payroll.employee.id,
      employeeName: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
      employeeNumber: payroll.employee.employeeNumber,
      period: payroll.period,
      periodType: payroll.periodType,
      payDate: new Date(),
      baseSalary: payroll.baseSalary,
      overtimePay: payroll.overtimePay,
      commissionPay: payroll.commissionPay,
      bonusPay: payroll.bonusPay,
      totalEarnings: payroll.totalEarnings,
      taxDeductions: payroll.taxDeductions,
      otherDeductions: payroll.otherDeductions,
      netPay: payroll.netPay,
      companyName: 'Tailoring Business Management',
      companyAddress: 'Dubai, UAE',
    };

    return this.createPayslipHTML(payslipData);
  }

  private static createPayslipPDF(data: PayslipData): Buffer {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Company header
    pdf.setFontSize(20);
    pdf.text(data.companyName, pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(data.companyAddress, pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(16);
    pdf.text('PAYSLIP', pageWidth / 2, 45, { align: 'center' });

    // Employee information
    pdf.setFontSize(12);
    pdf.text(`Employee: ${data.employeeName}`, 20, 65);
    pdf.text(`Employee Number: ${data.employeeNumber}`, 20, 75);
    pdf.text(`Period: ${data.period} (${data.periodType})`, 20, 85);
    pdf.text(`Pay Date: ${format(data.payDate, 'yyyy-MM-dd')}`, 20, 95);

    // Earnings section
    pdf.setFontSize(14);
    pdf.text('Earnings', 20, 115);

    pdf.setFontSize(10);
    let yPos = 125;
    pdf.text(`Base Salary: AED ${data.baseSalary.toFixed(2)}`, 30, yPos);
    yPos += 10;
    pdf.text(`Overtime Pay: AED ${data.overtimePay.toFixed(2)}`, 30, yPos);
    yPos += 10;
    pdf.text(`Commission Pay: AED ${data.commissionPay.toFixed(2)}`, 30, yPos);
    yPos += 10;
    pdf.text(`Bonus Pay: AED ${data.bonusPay.toFixed(2)}`, 30, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.text(`Total Earnings: AED ${data.totalEarnings.toFixed(2)}`, 30, yPos + 5);

    // Deductions section
    yPos += 25;
    pdf.setFontSize(14);
    pdf.text('Deductions', 20, yPos);

    pdf.setFontSize(10);
    yPos += 10;
    pdf.text(`Tax Deductions: AED ${data.taxDeductions.toFixed(2)}`, 30, yPos);
    yPos += 10;
    pdf.text(`Other Deductions: AED ${data.otherDeductions.toFixed(2)}`, 30, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.text(`Total Deductions: AED ${(data.taxDeductions + data.otherDeductions).toFixed(2)}`, 30, yPos + 5);

    // Net pay
    yPos += 20;
    pdf.setFontSize(16);
    pdf.text(`Net Pay: AED ${data.netPay.toFixed(2)}`, 20, yPos);

    // Footer
    pdf.setFontSize(8);
    pdf.text(`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, pageHeight - 20);
    pdf.text('This is a computer generated payslip', pageWidth / 2, pageHeight - 20, { align: 'center' });

    return Buffer.from(pdf.output('arraybuffer'));
  }

  private static createPayslipHTML(data: PayslipData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${data.employeeName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-address {
            font-size: 14px;
            color: #666;
          }
          .payslip-title {
            font-size: 20px;
            font-weight: bold;
            margin-top: 20px;
          }
          .employee-info {
            margin-bottom: 30px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .amount {
            font-weight: bold;
          }
          .total {
            font-size: 14px;
            font-weight: bold;
            border-top: 1px solid #333;
            padding-top: 5px;
          }
          .net-pay {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background-color: #f0f0f0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${data.companyName}</div>
          <div class="company-address">${data.companyAddress}</div>
          <div class="payslip-title">PAYSLIP</div>
        </div>

        <div class="employee-info">
          <div class="info-row"><span>Employee:</span> <span>${data.employeeName}</span></div>
          <div class="info-row"><span>Employee Number:</span> <span>${data.employeeNumber}</span></div>
          <div class="info-row"><span>Period:</span> <span>${data.period} (${data.periodType})</span></div>
          <div class="info-row"><span>Pay Date:</span> <span>${format(data.payDate, 'yyyy-MM-dd')}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Earnings</div>
          <div class="info-row"><span>Base Salary:</span> <span>AED ${data.baseSalary.toFixed(2)}</span></div>
          <div class="info-row"><span>Overtime Pay:</span> <span>AED ${data.overtimePay.toFixed(2)}</span></div>
          <div class="info-row"><span>Commission Pay:</span> <span>AED ${data.commissionPay.toFixed(2)}</span></div>
          <div class="info-row"><span>Bonus Pay:</span> <span>AED ${data.bonusPay.toFixed(2)}</span></div>
          <div class="info-row total"><span>Total Earnings:</span> <span class="amount">AED ${data.totalEarnings.toFixed(2)}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Deductions</div>
          <div class="info-row"><span>Tax Deductions:</span> <span>AED ${data.taxDeductions.toFixed(2)}</span></div>
          <div class="info-row"><span>Other Deductions:</span> <span>AED ${data.otherDeductions.toFixed(2)}</span></div>
          <div class="info-row total"><span>Total Deductions:</span> <span class="amount">AED ${(data.taxDeductions + data.otherDeductions).toFixed(2)}</span></div>
        </div>

        <div class="net-pay">
          Net Pay: AED ${data.netPay.toFixed(2)}
        </div>

        <div class="footer">
          Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}<br>
          This is a computer generated payslip
        </div>
      </body>
      </html>
    `;
  }

  static async generatePayslipFromHTML(htmlContent: string): Promise<Buffer> {
    // This would require a headless browser like Puppeteer for full HTML to PDF conversion
    // For now, return a simple PDF with the HTML content as text
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(htmlContent, pageWidth - 40);
    pdf.text(lines, 20, 20);

    return Buffer.from(pdf.output('arraybuffer'));
  }
}
