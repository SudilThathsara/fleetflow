import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PayrollPeriod from '@/models/PayrollPeriod';
import Driver from '@/models/Driver';
import RunningChartEntry from '@/models/RunningChartEntry';
import DriverAdvance from '@/models/DriverAdvance';
import CompanySettings from '@/models/CompanySettings';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { monthYear } = await req.json();
    if (!monthYear) return NextResponse.json({ success: false, message: 'monthYear required' }, { status: 400 });

    // Load statutory EPF/ETF and advance limits from Settings
    const settings = await CompanySettings.findOne();
    const epfEmpPct = typeof settings?.epfEmployeeRate === 'number' ? settings.epfEmployeeRate : 8;
    const epfEmplrPct = typeof settings?.epfEmployerRate === 'number' ? settings.epfEmployerRate : 12;
    const etfEmplrPct = typeof settings?.etfEmployerRate === 'number' ? settings.etfEmployerRate : 3;
    const maxMonthlyAdvance = typeof settings?.maxAdvanceDeductionPerMonth === 'number' ? settings.maxAdvanceDeductionPerMonth : 10000;

    const drivers = await Driver.find({ status: { $ne: 'Inactive' } });
    const entries = [];

    let totalGross = 0;
    let totalEmployeeEpf = 0;
    let totalEmployerEpf = 0;
    let totalEmployerEtf = 0;
    let totalAdvancesDeducted = 0;
    let totalNetSalary = 0;
    let totalEmployerCost = 0;

    for (const d of drivers) {
      const runningEntries = await RunningChartEntry.find({
        driver: d._id,
        monthYear,
      });
      const approvedOtHours = runningEntries.reduce((s: number, r: any) => s + (r.otHours || 0), 0);
      const otRate = d.overtimeHourlyRate || 450;
      const overtimeEarnings = approvedOtHours * otRate;

      const basicSalary = d.basicSalary || 65000;
      const allowances = d.fixedAllowances || 5000;
      const grossEarnings = basicSalary + overtimeEarnings + allowances;

      // Base for EPF/ETF (Basic + Qualifying Allowances)
      const qualifyingEarnings = basicSalary + allowances;

      // Employee EPF (Deducted from employee pay)
      const employeeEpfRate = d.epfApplicable ? epfEmpPct : 0;
      const employeeEpfDeduction = d.epfApplicable ? Math.round(qualifyingEarnings * (epfEmpPct / 100)) : 0;

      // Employer EPF (Employer expense - NOT deducted from employee!)
      const employerEpfRate = d.epfApplicable ? epfEmplrPct : 0;
      const employerEpfContribution = d.epfApplicable ? Math.round(qualifyingEarnings * (epfEmplrPct / 100)) : 0;

      // Employer ETF (Employer expense - NOT deducted from employee!)
      const employerEtfRate = d.etfApplicable ? etfEmplrPct : 0;
      const employerEtfContribution = d.etfApplicable ? Math.round(qualifyingEarnings * (etfEmplrPct / 100)) : 0;

      // Advances deduction (capped at maxMonthlyAdvance from Settings)
      const advances = await DriverAdvance.find({
        driver: d._id,
        remainingBalance: { $gt: 0 },
      });
      let advancesDeducted = 0;
      for (const adv of advances) {
        const deduct = Math.min(adv.remainingBalance, maxMonthlyAdvance);
        advancesDeducted += deduct;
      }

      const otherDeductions = 0;
      const netSalary = grossEarnings - employeeEpfDeduction - advancesDeducted - otherDeductions;
      const employerCost = grossEarnings + employerEpfContribution + employerEtfContribution;

      entries.push({
        driver: d._id,
        driverName: d.fullName,
        epfNumber: d.epfNumber,
        employmentType: d.employmentType,
        basicSalary,
        attendanceDays: 26,
        overtimeHours: approvedOtHours,
        overtimeEarnings,
        allowances,
        grossEarnings,
        qualifyingEarnings,
        employeeEpfRate,
        employeeEpfDeduction,
        employerEpfRate,
        employerEpfContribution,
        employerEtfRate,
        employerEtfContribution,
        advancesDeducted,
        otherDeductions,
        netSalary,
        totalEmployerCost: employerCost,
        amountPaid: 0,
        remainingBalance: netSalary,
        paymentStatus: 'Unpaid',
      });

      totalGross += grossEarnings;
      totalEmployeeEpf += employeeEpfDeduction;
      totalEmployerEpf += employerEpfContribution;
      totalEmployerEtf += employerEtfContribution;
      totalAdvancesDeducted += advancesDeducted;
      totalNetSalary += netSalary;
      totalEmployerCost += employerCost;
    }

    const payrollId = `PAY-${monthYear}`;
    let period = await PayrollPeriod.findOne({ monthYear });

    if (period) {
      period.entries = entries;
      period.totalGross = totalGross;
      period.totalEmployeeEpf = totalEmployeeEpf;
      period.totalEmployerEpf = totalEmployerEpf;
      period.totalEmployerEtf = totalEmployerEtf;
      period.totalAdvancesDeducted = totalAdvancesDeducted;
      period.totalNetSalary = totalNetSalary;
      period.totalEmployerCost = totalEmployerCost;
      await period.save();
    } else {
      period = await PayrollPeriod.create({
        payrollId,
        monthYear,
        status: 'Draft',
        entries,
        totalGross,
        totalEmployeeEpf,
        totalEmployerEpf,
        totalEmployerEtf,
        totalAdvancesDeducted,
        totalNetSalary,
        totalEmployerCost,
      });
    }

    return NextResponse.json({ success: true, message: 'Payroll period calculated successfully', data: period });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
