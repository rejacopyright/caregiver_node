import { Request, Response } from 'express'
import { VisitStatus } from '@prisma/client'

import { prismaX } from '@helper/pagination'
import moment from 'moment-timezone'

async function getScheduleCount(filter: any = {}) {
  const [upcoming, completed, missed] = await Promise.all([
    prismaX.schedule.count({ where: { status: 'UPCOMING', ...filter } }),
    prismaX.schedule.count({ where: { status: 'COMPLETED', ...filter } }),
    prismaX.schedule.count({ where: { status: 'MISSED', ...filter } }),
  ])

  return { upcoming, completed, missed }
}

export const scheduleList = async (_req: Request, res: Response) => {
  const status = _req.query?.status
    ? (_req.query?.status?.toString()?.toUpperCase() as VisitStatus)
    : null

  // JUST for test (should be using cron job)
  try {
    await prismaX.schedule.updateMany({
      where: {
        status: 'UPCOMING',
        shiftEnd: { lt: moment().tz('Asia/Jakarta').toDate() },
      },
      data: { status: 'MISSED' },
    })
  } catch {
    //
  }

  const data = await prismaX.schedule.paginate({
    limit: 5,
    orderBy: { shiftStart: 'asc' },
    where: { status: status ? status : { in: ['COMPLETED', 'MISSED', 'UPCOMING'] } },
  })

  return res.status(200).json({ data })
}

export const scheduleToday = async (_req: Request, res: Response) => {
  const status = _req.query?.status
    ? (_req.query?.status?.toString()?.toUpperCase() as VisitStatus)
    : null

  const gt = moment().startOf('day').toDate()
  const lt = moment().endOf('day').toDate()

  // JUST for test (should be using cron job)
  await prismaX.schedule.updateMany({
    where: {
      status: 'UPCOMING',
      shiftEnd: { lt: moment().tz('Asia/Jakarta').toDate() },
    },
    data: { status: 'MISSED' },
  })

  const data = await prismaX.schedule.paginate({
    limit: 5,
    orderBy: { shiftStart: 'asc' },
    where: {
      AND: [
        { shiftStart: { gt } },
        { shiftStart: { lt } },
        { status: status ? status : { in: ['COMPLETED', 'MISSED', 'UPCOMING'] } },
      ],
    },
  })

  return res.status(200).json({ data })
}

export const scheduleDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ message: 'Schedule ID is required.' })
    }

    const schedule = await prismaX.schedule.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' })
    }

    return res.status(200).json({
      message: 'Success',
      data: schedule,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    })
  }
}

export const scheduleActive = async (_req: Request, res: Response) => {
  try {
    const schedule = await prismaX.schedule.findFirst({
      where: { status: 'INPROGRESS' },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return res.status(200).json({
      message: 'Success',
      data: schedule,
    })
  } catch (error: any) {
    return res.status(400).json({
      message: 'Internal server error.',
      error,
    })
  }
}

export const startVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { lat, lng } = req.body

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' })
    }

    const now = moment().tz('Asia/Jakarta').toDate()

    const schedule = await prismaX.schedule.findUnique({ where: { id } })

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' })
    }

    const ongoing = await prismaX.schedule.findFirst({
      where: {
        status: 'INPROGRESS',
        shiftEnd: { gt: now },
      },
    })

    if (ongoing && ongoing.id !== id) {
      return res.status(400).json({
        message: `You already have an ongoing visit.`,
      })
    }

    const shiftEnd = moment(schedule.shiftEnd).toDate()

    if (schedule.status === 'INPROGRESS' && now < shiftEnd) {
      return res.status(400).json({
        message: 'This schedule is already in progress and has not ended yet.',
      })
    }

    const updated = await prismaX.schedule.update({
      where: { id },
      data: {
        startTime: now,
        startLat: parseFloat(lat),
        startLng: parseFloat(lng),
        status: 'INPROGRESS',
      },
    })

    return res.status(200).json({
      message: 'Visit started successfully.',
      data: updated,
    })
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const endVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { lat, lng } = req.body

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' })
    }

    const schedule = await prismaX.schedule.findUnique({ where: { id } })

    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' })

    if (schedule.status !== 'INPROGRESS') {
      return res.status(400).json({ message: 'Cannot end visit that is not in progress.' })
    }

    const updated = await prismaX.schedule.update({
      where: { id },
      data: {
        endTime: moment().toDate(),
        endLat: parseFloat(lat),
        endLng: parseFloat(lng),
        status: 'COMPLETED',
      },
    })

    return res.status(200).json({
      message: 'Visit ended successfully.',
      data: updated,
    })
  } catch (error: any) {
    console.error(error)

    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const getScheduleReport = async (_req: Request, res: Response) => {
  try {
    const data = await getScheduleCount()

    return res.status(200).json({
      message: 'Schedule report fetched successfully.',
      data,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

export const getTodayScheduleReport = async (_req: Request, res: Response) => {
  try {
    const gte = moment().startOf('day').toDate()
    const lte = moment().endOf('day').toDate()

    const data = await getScheduleCount({ shiftStart: { gte, lte } })

    return res.status(200).json({
      message: "Today's schedule report fetched successfully.",
      data,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}
