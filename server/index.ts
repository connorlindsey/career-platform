import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { pool } from './config'
import {
  login,
  logout,
  register,
  updatePassword,
  validateSession,
  authenticateRequest,
} from './src/controllers/account'
import { getAccounts, getEarlyAccess } from './src/controllers/admin'
import {
  getAllAims,
  getAims,
  getAim,
  createAim,
  deleteAim,
  editAim,
  addCompletion,
  removeCompletion,
  getCompletion,
} from './src/controllers/aim'
import cookieParser from 'cookie-parser'

const PORT = process.env.PORT || 8000
const isProduction = process.env.NODE_ENV === 'production'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: isProduction ? 'https://twelvemonth.vercel.app' : 'http://localhost:3000',
    credentials: true,
  })
)
app.use(cookieParser())

app.get('/', (req, res) => res.send('twelvemonth API'))

// Early Access
const addEarlyAccess = (req, res) => {
  const { email, name } = req.body
  pool.query('INSERT INTO earlyaccess (email, name) VALUES ($1, $2)', [email, name], (error) => {
    if (error) {
      console.error(error.message)
      res.status(500).json({ status: 'Error', message: error.message })
    }
    res.status(200).json({ status: 'Success', message: 'Subscriber added' })
  })
}

// Check authentication for all requests
app.all('*', (req, res, next) => authenticateRequest(req, res, next))

// Early Access
app.route('/earlyaccess').get(getEarlyAccess).post(addEarlyAccess)

// Authentication
app.route('/register').post(register)
app.route('/login').post(login)
app.route('/logout').post(logout)
app.route('/updatePassword').post(updatePassword)
app.route('/authenticate').post(validateSession)

// Admin
app.route('/admin/accounts').get(getAccounts)
app.route('/admin/earlyAccess').get(getEarlyAccess)
app.route('/admin/aims').get(getAllAims)

// Aims
app.route('/aims/').get(getAims)
app.route('/aims/:aim_id').get(getAim)
app.route('/aim').post(createAim).put(editAim).delete(deleteAim)
app.route('/aim/:aim_id/completion').get(getCompletion).post(addCompletion).delete(removeCompletion)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})

process.on('uncaughtException', function (error) {
  console.log(error.stack)
})
