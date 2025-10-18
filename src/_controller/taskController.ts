import { Request, Response } from 'express'

import { prismaX } from '@helper/pagination'

export const getTasksBySchedule = async (req: Request, res: Response) => {
  try {
    const scheduleId = req?.params?.id

    if (!scheduleId) {
      return res.status(400).json({ message: 'schedule ID is required.' })
    }

    const tasks = await prismaX.task.findMany({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' },
    })

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this schedule.' })
    }

    return res.status(200).json({
      message: 'Success',
      count: tasks.length,
      data: tasks,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const taskId = req?.params?.id
    const { status, reason } = req.body

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' })
    }

    const task = await prismaX.task.findUnique({ where: { id: taskId } })

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' })
    }

    const validStatuses = ['PENDING', 'COMPLETED', 'NOT_COMPLETED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      })
    }

    if (status === 'NOT_COMPLETED' && !reason) {
      return res.status(400).json({
        message: 'Reason is required when marking task as NOT_COMPLETED.',
      })
    }

    const updated = await prismaX.task.update({
      where: { id: taskId },
      data: {
        status,
        reason: reason || null,
      },
    })

    return res.status(200).json({
      message: 'Task updated successfully.',
      data: updated,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}
