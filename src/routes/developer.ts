import express from 'express'
const router = express.Router()

import { resetAllDatas } from '@controller/developerController'

router.post('/database/reset', resetAllDatas)

export default router
