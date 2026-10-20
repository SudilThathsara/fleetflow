import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SparePart from '@/models/SparePart';
import InventoryTransaction from '@/models/InventoryTransaction';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { partId, newQuantity, reason, notes } = await req.json();

    const part = await SparePart.findById(partId);
    if (!part) return NextResponse.json({ success: false, message: 'Spare part not found' }, { status: 404 });

    const previousStock = part.currentStock;
    const newStock = Number(newQuantity);
    const diff = newStock - previousStock;

    part.currentStock = newStock;
    await part.save();

    const txCount = await InventoryTransaction.countDocuments();
    const transactionId = `ADJ-${Date.now().toString().slice(-6)}-${String(txCount + 1).padStart(3, '0')}`;

    const tx = await InventoryTransaction.create({
      transactionId,
      part: part._id,
      sku: part.sku,
      partName: part.name,
      type: 'ADJUSTMENT',
      quantity: Math.abs(diff),
      unitCost: part.unitCost,
      totalCost: Math.abs(diff) * part.unitCost,
      previousStock,
      newStock,
      reference: reason || 'Stock Count Reconciliation',
      date: new Date(),
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { part, transaction: tx },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
