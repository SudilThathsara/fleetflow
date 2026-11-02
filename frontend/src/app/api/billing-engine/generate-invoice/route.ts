import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ContractMonthlyBillingRun from '@/models/ContractMonthlyBillingRun';
import Invoice from '@/models/Invoice';
import CustomerCompany from '@/models/CustomerCompany';
import CompanySettings from '@/models/CompanySettings';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { calculationData, approvedBy } = await req.json();

    if (!calculationData) {
      return NextResponse.json({ success: false, message: 'calculationData required' }, { status: 400 });
    }

    const runCount = await ContractMonthlyBillingRun.countDocuments();
    const billingRunId = `BILL-${calculationData.billingMonth}-${String(runCount + 1).padStart(3, '0')}`;

    const invCount = await Invoice.countDocuments();
    const settings = await CompanySettings.findOne();
    const invoiceNumber = `${settings?.invoicePrefix || `INV-${calculationData.billingMonth.replace('-', '')}-`}${String(invCount + 1).padStart(4, '0')}`;

    const invoiceItems = [];
    for (const line of calculationData.vehicleLines) {
      invoiceItems.push({
        description: `Monthly Hire - ${line.registrationNumber} (${line.vehicleCategory}) [${calculationData.billingMonth}]`,
        vehicleReg: line.registrationNumber,
        quantity: 1,
        unitPrice: line.monthlyBasicHire,
        total: line.monthlyBasicHire,
        chargeType: 'Monthly Basic Hire',
        includedKm: line.includedKm,
        actualKm: line.actualKm,
      });

      if (line.billableExtraKm > 0) {
        invoiceItems.push({
          description: `Extra Mileage - ${line.registrationNumber} (${line.billableExtraKm} km @ LKR ${line.extraKmRate}/km)`,
          vehicleReg: line.registrationNumber,
          quantity: line.billableExtraKm,
          unitPrice: line.extraKmRate,
          total: line.extraKmCharge,
          chargeType: 'Extra Kilometres',
          billableExtraKm: line.billableExtraKm,
          extraKmRate: line.extraKmRate,
        });
      }

      if (line.approvedOtHours > 0) {
        invoiceItems.push({
          description: `Approved Driver Overtime - ${line.registrationNumber} (${line.approvedOtHours} hrs @ LKR ${line.otRate}/hr)`,
          vehicleReg: line.registrationNumber,
          quantity: line.approvedOtHours,
          unitPrice: line.otRate,
          total: line.otCharge,
          chargeType: 'Overtime',
          otHours: line.approvedOtHours,
          otRate: line.otRate,
        });
      }

      if (line.fuelCharge > 0) {
        invoiceItems.push({
          description: `Fuel Reimbursement - ${line.registrationNumber}`,
          vehicleReg: line.registrationNumber,
          quantity: 1,
          unitPrice: line.fuelCharge,
          total: line.fuelCharge,
          chargeType: 'Fuel',
        });
      }
    }

    const company = await CustomerCompany.findById(calculationData.customerCompany);

    const newInvoice = await Invoice.create({
      invoiceNumber,
      invoiceType: 'Monthly Agreement',
      customerCompany: calculationData.customerCompany,
      customerName: calculationData.companyName,
      customerPhone: company?.phone || '+94 11 234 5678',
      customerAddress: company?.billingAddress || 'Colombo, Sri Lanka',
      project: calculationData.project,
      projectName: calculationData.projectName,
      contract: calculationData.contractId,
      contractNumber: calculationData.contractNumber,
      billingMonth: calculationData.billingMonth,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: invoiceItems,
      subtotal: calculationData.subtotal,
      discount: calculationData.discount || 0,
      taxAmount: calculationData.taxAmount || 0,
      totalAmount: calculationData.totalAmount,
      paidAmount: 0,
      balanceDue: calculationData.totalAmount,
      status: 'Issued',
      paymentTerms: settings?.terms || 'Payment due within 15 days of invoice date.',
    });

    const billingRun = await ContractMonthlyBillingRun.create({
      billingRunId,
      contract: calculationData.contractId,
      contractNumber: calculationData.contractNumber,
      customerCompany: calculationData.customerCompany,
      companyName: calculationData.companyName,
      project: calculationData.project,
      projectName: calculationData.projectName,
      billingMonth: calculationData.billingMonth,
      rateVersionUsed: calculationData.rateVersionUsed || 1,
      vehicleLines: calculationData.vehicleLines,
      subtotal: calculationData.subtotal,
      discount: calculationData.discount || 0,
      taxAmount: calculationData.taxAmount || 0,
      totalAmount: calculationData.totalAmount,
      status: 'Invoiced',
      generatedInvoiceId: newInvoice._id,
      generatedInvoiceNumber: invoiceNumber,
      warnings: calculationData.warnings,
      approvedBy: approvedBy || 'Admin',
      approvedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Monthly invoice and billing run generated successfully',
      data: { billingRun, invoice: newInvoice },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
