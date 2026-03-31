import { db } from "@/lib/db"
import type { NotificationType } from "@prisma/client"

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "INFO",
  link?: string
) {
  return db.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link: link ?? null,
    },
  })
}

export async function createBulkNotifications(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType = "INFO",
  link?: string
) {
  if (userIds.length === 0) return

  return db.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      link: link ?? null,
    })),
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { read: true },
  })
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  })
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}

export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
) {
  const where: { userId: string; read?: boolean } = { userId }
  if (unreadOnly) {
    where.read = false
  }

  const skip = (page - 1) * limit

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.notification.count({ where }),
    db.notification.count({
      where: { userId, read: false },
    }),
  ])

  return { notifications, total, unreadCount }
}
