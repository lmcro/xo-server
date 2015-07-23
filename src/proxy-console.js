import {parse} from 'url'
import {request} from 'https'

export default function proxyConsole (ws, vmConsole, sessionId) {
  const url = parse(vmConsole.location)

  console.log('proxy console to', {
    method: 'CONNECT',
    headers: {
      cookie: `session_id=${sessionId}`
    },

    host: url.host,
    path: url.path,

    rejectUnauthorized: false
  })

  const req = request({
    // method: 'CONNECT',
    headers: {
      cookie: `session_id=${sessionId}`
    },

    host: url.host,
    path: url.path,

    rejectUnauthorized: false
  })

  req.on('response', response => {
    console.log(response.statusCode)
  })

  req.on('connect', (response, socket, head) => {
    console.log('connected')

    socket.on('data', data => {
      console.log('tcp → ws', data.length)
      ws.send(data)
    })
    ws.on('message', data => {
      console.log('ws → tcp', data.length)
      socket.write(data)
    })

    socket.on('end', () => {
      console.log('tcp closed')
      ws.close()
    })
  })

  req.on('error', error => {
    console.error('console error', error)
  })
}
