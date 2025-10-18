import 'module-alias/register'
import express from 'express'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import { renderFile } from 'ejs'
import createError from 'http-errors'
import moment from 'moment-timezone'
import logger from 'morgan'
import path from 'path'

import developerRouter from './routes/developer'
import indexRouter from './routes/index'
import scheduleRouter from './routes/schedule'
import taskRouter from './routes/task'

const app = express()

moment.tz.setDefault('Asia/Jakarta')
moment.locale('id')

// const corsOptions: CorsOptions = { origin: true, credentials: true, allowedHeaders: '*' }

// view engine setup
app.set('query parser', 'extended')
app.set('views', path.join(__dirname, '../views'))
app.engine('html', renderFile)
app.set('view engine', 'html')

app.enable('trust proxy')
app.use(logger('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())
app.use(cors())

app.use('/static', express.static(path.join(__dirname, '../public')))

app.use('/', indexRouter)
app.use('/api/v1/schedule', scheduleRouter)
app.use('/api/v1/task', taskRouter)
app.use('/api/v1/developer', developerRouter)
// app.use('/api/v1/auth', authAPI)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

console.info('API is Ready')

export default app
