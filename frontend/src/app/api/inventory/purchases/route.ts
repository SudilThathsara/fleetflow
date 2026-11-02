import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SparePart from '@/models/SparePart';
import InventoryTransaction from '@/models/InventoryTransaction';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAuth(req, ['super_admin', 'manager', 'maintenance', 'operations']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { partId, quantity, unitCost, supplierName, reference, notes } = await req.json();

    const part = await SparePart.findById(partId);
    if (!part) return NextResponse.json({ success: false, message: 'Spare part not found' }, { status: 404 });

    const qty = Number(quantity);
    const cost = Number(unitCost) || part.unitCost;
    const previousStock = part.currentStock;
    const newStock = previousStock + qty;

    part.currentStock = newStock;
    part.unitCost = cost;
    await part.save();

    const txCount = await InventoryTransaction.countDocuments();
    const transactionId = `TX-${Date.now().toString().slice(-6)}-${String(txCount + 1).padStart(3, '0')}`;

    const tx = await InventoryTransaction.create({
      transactionId,
      part: part._id,
      sku: part.sku,
      partName: part.name,
      type: 'PURCHASE_RECEIPT',
      quantity: qty,
      unitCost: cost,
      totalCost: qty * cost,
      previousStock,
      newStock,
      reference: reference || `Supplier: ${supplierName || 'General'}`,
      date: new Date(),
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Stock received and inventory increased successfully',
      data: { part, transaction: tx },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
