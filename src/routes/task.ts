import express from 'express'
const router = express.Router()

import { getTasksBySchedule, updateTaskStatus } from '@controller/taskController'

router.get('/schedule/:id', getTasksBySchedule)
router.post('/:id/update', updateTaskStatus)

export default router
