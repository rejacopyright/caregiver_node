import { PrismaClient } from '@prisma/client'

import moment from 'moment-timezone'

const prisma = new PrismaClient()

const JAKARTA_CENTER = { lat: -6.2, lng: 106.816666 }

function randomNearbyCoord(baseLat: number, baseLng: number, radiusInKm = 5) {
  const r = radiusInKm / 111
  const u = Math.random()
  const v = Math.random()
  const w = r * Math.sqrt(u)
  const t = 2 * Math.PI * v
  const latOffset = w * Math.cos(t)
  const lngOffset = (w * Math.sin(t)) / Math.cos(baseLat * (Math.PI / 180))

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  }
}

function roundToNearest30(date: Date): Date {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  // Round to the nearest 30 minutes (00 or 30)
  const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0

  if (minutes >= 45) rounded.setHours(rounded.getHours() + 1)
  rounded.setMinutes(roundedMinutes, 0, 0)

  return rounded
}

function randomShiftTime(baseDate: Date) {
  const now = new Date()

  // Pick a random offset between now and the next 3 hours
  const randomOffsetHours = Math.floor(Math.random() * 4)
  const shiftEnd = new Date(baseDate)

  shiftEnd.setHours(now.getHours() + randomOffsetHours, now.getMinutes(), 0, 0)

  // Round shiftEnd to the nearest 30 minutes
  const roundedEnd = roundToNearest30(shiftEnd)
  // Shift start is always 1 hour before shiftEnd
  const shiftStart = new Date(roundedEnd)

  shiftStart.setHours(roundedEnd.getHours() - 1)
  // Round shiftStart as well
  const roundedStart = roundToNearest30(shiftStart)

  return { shiftStart: roundedStart, shiftEnd: roundedEnd }
}

async function main() {
  await prisma.task.deleteMany()
  await prisma.schedule.deleteMany()

  const clientNames = [
    'John Doe',
    'Mary Smith',
    'James Carter',
    'Patricia Johnson',
    'Robert Brown',
    'Linda Davis',
    'Michael Wilson',
    'Barbara Miller',
    'William Taylor',
    'Elizabeth Anderson',
  ]

  const careTasks = [
    'Check blood pressure',
    'Give medication',
    'Assist with bathing',
    'Prepare meal',
    'Light exercise',
    'Record health notes',
  ]

  const addresses = [
    'Jl. MH Thamrin No.1, Menteng, Jakarta Pusat',
    'Jl. Kemang Raya No.22, Jakarta Selatan',
    'Jl. Pluit Indah No.8, Penjaringan, Jakarta Utara',
    'Jl. Daan Mogot No.15, Grogol, Jakarta Barat',
    'Jl. Rawamangun Muka No.10, Jakarta Timur',
    'Jl. Sudirman No.45, Setiabudi, Jakarta Selatan',
    'Jl. Cikini Raya No.5, Jakarta Pusat',
    'Jl. Radio Dalam No.3, Kebayoran Baru, Jakarta Selatan',
    'Jl. Kelapa Gading Boulevard No.2, Jakarta Utara',
    'Jl. Fatmawati No.99, Cipete, Jakarta Selatan',
  ]

  const schedules = []
  const now = moment().tz('Asia/Jakarta')

  // -------------------------------------------------------
  // 50 UPCOMING schedules (Next 3 days)
  // -------------------------------------------------------
  for (let i = 0; i < 50; i++) {
    const dayOffset = i % 3 // today, tomorrow, day after tomorrow
    const date = now.clone().add(dayOffset, 'days').toDate()

    const { shiftStart, shiftEnd } = randomShiftTime(date)
    const coords = randomNearbyCoord(JAKARTA_CENTER.lat, JAKARTA_CENTER.lng)
    const client = clientNames[i % clientNames.length]
    const address = addresses[i % addresses.length]

    const schedule = await prisma.schedule.create({
      data: {
        clientName: client,
        shiftStart,
        shiftEnd,
        placeName: `Client Home ${i + 1}`,
        address,
        status: 'UPCOMING',
        startLat: coords.lat,
        startLng: coords.lng,
        tasks: {
          create: careTasks.map((task) => ({
            description: task,
            status: 'PENDING',
          })),
        },
      },
    })

    schedules.push(schedule)
  }

  // -------------------------------------------------------
  // 1 COMPLETED schedules (today)
  // -------------------------------------------------------
  for (let i = 0; i < 1; i++) {
    const date = now.clone().toDate()
    const { shiftStart, shiftEnd } = randomShiftTime(date)
    const coordsStart = randomNearbyCoord(JAKARTA_CENTER.lat, JAKARTA_CENTER.lng)
    const coordsEnd = randomNearbyCoord(JAKARTA_CENTER.lat, JAKARTA_CENTER.lng)
    const client = clientNames[i % clientNames.length]
    const address = addresses[i % addresses.length]

    const schedule = await prisma.schedule.create({
      data: {
        clientName: client,
        shiftStart,
        shiftEnd,
        placeName: `Client Home Completed ${i + 1}`,
        address,
        status: 'COMPLETED',
        startTime: moment(shiftStart).add(5, 'minutes').toDate(),
        endTime: moment(shiftEnd).add(10, 'minutes').toDate(),
        startLat: coordsStart.lat,
        startLng: coordsStart.lng,
        endLat: coordsEnd.lat,
        endLng: coordsEnd.lng,
        tasks: {
          create: careTasks.map((task) => ({
            description: task,
            status: 'COMPLETED',
          })),
        },
      },
    })

    schedules.push(schedule)
  }

  // -------------------------------------------------------
  // 1 MISSED schedules (today)
  // -------------------------------------------------------
  for (let i = 0; i < 1; i++) {
    const date = now.clone().subtract(2, 'hours').toDate()
    const { shiftStart, shiftEnd } = randomShiftTime(date)
    const coords = randomNearbyCoord(JAKARTA_CENTER.lat, JAKARTA_CENTER.lng)
    const client = clientNames[i % clientNames.length]
    const address = addresses[i % addresses.length]

    const schedule = await prisma.schedule.create({
      data: {
        clientName: client,
        shiftStart,
        shiftEnd,
        placeName: `Client Home Missed ${i + 1}`,
        address,
        status: 'MISSED',
        startLat: coords.lat,
        startLng: coords.lng,
        tasks: {
          create: careTasks.map((task) => ({
            description: task,
            status: 'NOT_COMPLETED',
            reason: 'Caregiver did not arrive.',
          })),
        },
      },
    })

    schedules.push(schedule)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
