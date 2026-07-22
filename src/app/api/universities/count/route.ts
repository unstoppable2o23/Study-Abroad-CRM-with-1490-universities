import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.university.count({ where: { deletedAt: null } });
    return NextResponse.json({ success: true, data: { count } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to count" }, { status: 500 });
  }
}
