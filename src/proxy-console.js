import partialStream from 'partial-stream'
import {connect} from 'tls'
import {parse} from 'url'

export default function proxyConsole (ws, vmConsole, sessionId) {
  const url = parse(vmConsole.location)

  const socket = connect({
    host: url.host,
    port: url.port || 443,
    rejectUnauthorized: false
  }, () => {
    // Write headers.
    socket.write([
      `CONNECT ${url.path} HTTP/1.0`,
      `Host: ${url.hostname}`,
      `Cookie: session_id=${sessionId}`,
      '', ''
    ].join('\r\n'))

    socket.pipe(partialStream('\r\n\r\n', headers => {
      console.log({headers})
    })).on('data', data => {
      console.log('tcp → ws', data.length)
      ws.send(data)
    }).on('end', () => {
      console.log('tcp closed')
      ws.close()
    })

    ws.on('message', data => {
      console.log('ws → tcp', data.length)
      socket.write(data)
    })
  })
}
