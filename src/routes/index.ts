import express from 'express'
const router = express.Router()

import { health, index } from '@controller/indexController'

router.get('/', index)
router.get('/health', health)

export default router
