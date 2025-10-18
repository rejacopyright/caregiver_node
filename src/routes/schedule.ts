import express from 'express'
const router = express.Router()

import {
  endVisit,
  getScheduleReport,
  getTodayScheduleReport,
  scheduleActive,
  scheduleDetail,
  scheduleList,
  scheduleToday,
  startVisit,
} from '@controller/scheduleController'

router.get('/', scheduleList)
router.get('/today', scheduleToday)
router.get('/active', scheduleActive)
router.get('/report', getScheduleReport)
router.get('/report/today', getTodayScheduleReport)
router.get('/:id', scheduleDetail)
router.post('/:id/start', startVisit)
router.post('/:id/end', endVisit)

export default router
