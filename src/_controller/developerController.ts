import { Request, Response } from 'express'

import { exec } from 'child_process'
import path from 'path'

export const resetAllDatas = async (_req: Request, res: Response) => {
  try {
    const projectRoot = path.resolve(__dirname, '../../')

    exec('npm run seed', { cwd: projectRoot })

    return res.status(200).json({
      message: 'Seeder started in background.',
    })
  } catch (error: any) {
    return res.status(500).json({
      message: 'Seeder failed.',
      error: error.message,
    })
  }
}
