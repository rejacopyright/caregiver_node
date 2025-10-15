import { Request, Response } from 'express'

export const index = (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'Index' })
}

export const health = (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'Work' })
}
