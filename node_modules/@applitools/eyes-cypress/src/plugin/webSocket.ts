import WebSocket from 'ws'
import {v4 as uuid} from 'uuid'
import {type Socket} from 'net'

export type SocketWithUniversal = {
  setPassthroughListener: (_listener: (_message: any) => void) => void
  once(_type: any, _fn: any): any
  on(_type: any, _fn: any): any
  off(_type: any, _fn: any): any
  disconnect(): void
  ref(): () => boolean
  unref(): () => boolean
  send(_message: any): () => boolean
  request(_name: string, _payload: any): any
}

export default function connectSocket(url: string): SocketWithUniversal {
  const socket: WebSocket & {_socket?: Socket} = new WebSocket(url)
  let passthroughListener: any
  const listeners = new Map()
  const queue = new Set<any>()
  let isReady = false

  attach()

  function attach() {
    if (socket.readyState === WebSocket.CONNECTING) socket.on('open', () => attach())
    else if (socket.readyState === WebSocket.OPEN) {
      isReady = true
      queue.forEach((command: any) => command())
      queue.clear()

      socket.on('message', message => {
        const {name, key, payload} = deserialize(message)
        const fns: any[] = listeners.get(name)
        const keyListeners: any[] = key && listeners.get(`${name}/${key}`)
        if (fns) fns.forEach(fn => fn(payload, key))
        if (keyListeners) keyListeners.forEach(fn => fn(payload, key))

        if (!fns && !keyListeners && passthroughListener) {
          passthroughListener(message)
        }
      })
    }
  }

  function disconnect() {
    if (!socket) return
    socket.terminate()
    isReady = false
    passthroughListener = null
    queue.clear()
  }

  function setPassthroughListener(fn: any) {
    passthroughListener = fn
  }

  function send(message: string) {
    const command = () => socket.send(message)
    if (isReady) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function on(type: string | {name: string; key: string}, fn: any) {
    const name = typeof type === 'string' ? type : `${type.name}/${type.key}`
    let fns = listeners.get(name)
    if (!fns) {
      fns = new Set()
      listeners.set(name, fns)
    }
    fns.add(fn)
    return () => off(name, fn)
  }

  function once(type: any, fn: any) {
    const off = on(type, (...args: any[]) => (fn(...args), off()))
    return off
  }

  function off(name: string, fn: any) {
    if (!fn) return listeners.delete(name)
    const fns = listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) listeners.delete(name)
    return existed
  }

  function emit(type: any, payload: any) {
    return send(serialize(type, payload))
  }

  function request(name: string, payload: any) {
    return new Promise((resolve, reject) => {
      const key = uuid()
      emit({name, key}, payload)
      once({name, key}, (response: any) => {
        if (response.error) return reject(response.error)
        return resolve(response.result)
      })
    })
  }

  function ref() {
    const command = () => socket._socket.ref()
    if (isReady) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function unref() {
    const command = () => socket._socket.unref()
    if (isReady) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  return {
    setPassthroughListener,
    send,
    on,
    once,
    off,
    request,
    disconnect,
    ref,
    unref,
  }
}

function serialize(type: any, payload: any) {
  const message = typeof type === 'string' ? {name: type, payload} : {name: type.name, key: type.key, payload}
  return JSON.stringify(message)
}

function deserialize(message: any) {
  return JSON.parse(message)
}
