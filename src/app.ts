import express from 'express'
import { Controller } from './controller'

let controller = new Controller()
const app = express()
const port = 5000
app.get('/test', controller.updateRemoteApi)
app.listen(port, () => {
	return console.log(`server is listening on ${port}`)
})
