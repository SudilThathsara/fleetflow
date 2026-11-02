import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contract from '@/models/Contract';
import RunningChartEntry from '@/models/RunningChartEntry';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'accountant']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { contractId, billingMonth } = await req.json();

    if (!contractId || !billingMonth) {
      return NextResponse.json({ success: false, message: 'contractId and billingMonth required' }, { status: 400 });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });

    const rateCard = contract.rateCard;
    const vehicleLines = [];
    const warnings: string[] = [];
    let totalSubtotal = 0;

    for (const vAssign of contract.assignedVehicles) {
      const entries = await RunningChartEntry.find({
        vehicleReg: vAssign.registrationNumber,
        monthYear: billingMonth,
      });

      const actualKm = entries.reduce((sum: number, e: any) => sum + (e.totalKm || 0), 0);
      const approvedOtHours = entries.reduce((sum: number, e: any) => sum + (e.otHours || 0), 0);
      const fuelTotal = entries.reduce((sum: number, e: any) => sum + (e.fuelCost || 0), 0);

      if (entries.length === 0) {
        warnings.push(`No running chart entries found for vehicle ${vAssign.registrationNumber} in ${billingMonth}`);
      }

      // 3,000 KM Rule: Billable extra km = max(0, actualKm - includedKm)
      const includedKm = rateCard.includedMonthlyKm || 3000;
      const billableExtraKm = Math.max(0, actualKm - includedKm);
      const extraKmRate = rateCard.extraKmRate || 100;
      const extraKmCharge = billableExtraKm * extraKmRate;

      const otRate = rateCard.overtimeHourlyRate || 600;
      const otCharge = approvedOtHours * otRate;

      // Inclusions rule: do not double charge if included in monthly hire
      const driverCharge = rateCard.driverServiceIncluded ? 0 : (rateCard.driverMonthlyRate || 0);
      const fuelCharge = rateCard.fuelIncluded ? 0 : (fuelTotal > 0 ? fuelTotal : 0);

      const basicHire = rateCard.monthlyBasicHireRate || 250000;
      const lineSubtotal = basicHire + extraKmCharge + otCharge + driverCharge + fuelCharge;
      totalSubtotal += lineSubtotal;

      vehicleLines.push({
        vehicle: vAssign.vehicle,
        registrationNumber: vAssign.registrationNumber,
        vehicleCategory: vAssign.vehicleCategory,
        monthlyBasicHire: basicHire,
        includedKm,
        actualKm,
        billableExtraKm,
        extraKmRate,
        extraKmCharge,
        approvedOtHours,
        otRate,
        otCharge,
        fuelCharge,
        driverCharge,
        additionalCharges: 0,
        lineSubtotal,
        notes: `${actualKm} km recorded. ${billableExtraKm} billable extra km. ${approvedOtHours} OT hours.`,
      });
    }

    const discount = 0;
    const taxAmount = 0;
    const totalAmount = totalSubtotal - discount + taxAmount;

    return NextResponse.json({
      success: true,
      data: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        customerCompany: contract.customerCompany,
        companyName: contract.companyName,
        project: contract.project,
        projectName: contract.projectName,
        billingMonth,
        rateVersionUsed: rateCard.version || 1,
        vehicleLines,
        subtotal: totalSubtotal,
        discount,
        taxAmount,
        totalAmount,
        warnings,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
