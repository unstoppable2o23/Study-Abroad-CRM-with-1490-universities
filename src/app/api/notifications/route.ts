import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRedisClient, CACHE_KEYS, deleteCache, setCache } from "@/lib/redis";
import { success, error } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const redis = await getRedisClient();
  const cacheKey = CACHE_KEYS.notifications(user.userId) + `:${page}:${limit}:${unreadOnly}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  }

  const where: any = { userId: user.userId };
  if (unreadOnly) where.read = false;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  const response = {
    success: true,
    data: notifications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };

  if (redis) await setCache(cacheKey, response, 60);

  return NextResponse.json(response);
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: user.userId, read: false },
        data: { read: true },
      });
    } else if (notificationIds?.length) {
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds }, userId: user.userId },
        data: { read: true },
      });
    }

    const redis = await getRedisClient();
    if (redis) {
      await redis.del(CACHE_KEYS.notifications(user.userId));
    }

    return success({ message: "Notifications marked as read" });
  } catch {
    return error("Failed to update notifications", 500);
  }
}