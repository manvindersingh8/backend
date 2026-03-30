import { Router } from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js'
import { refreshAccessToken } from '../helpers/refreshAndAccessToken.js'
import { verifyJWT } from '../middlewares/verifyjwt.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.post('/refresh-token', refreshAccessToken)

export default router