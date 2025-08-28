"use client"

import Pusher from "pusher-js"

// Mock Pusher configuration - in production, use environment variables
const pusherConfig = {
  key: "mock-pusher-key",
  cluster: "us2",
  forceTLS: true,
}

let pusherInstance: Pusher | null = null

export function getPusherInstance(): Pusher {
  if (!pusherInstance) {
    // In a real implementation, you would use actual Pusher credentials
    // For demo purposes, we'll create a mock instance
    pusherInstance = new Pusher(pusherConfig.key, {
      cluster: pusherConfig.cluster,
      forceTLS: pusherConfig.forceTLS,
    })
  }
  return pusherInstance
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}

// Mock Pusher class for demo purposes
class MockPusher {
  private channels: Map<string, MockChannel> = new Map()
  private connected = false

  constructor(key: string, options: any) {
    // Simulate connection
    setTimeout(() => {
      this.connected = true
      console.log("Mock Pusher connected")
    }, 1000)
  }

  subscribe(channelName: string): MockChannel {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new MockChannel(channelName))
    }
    return this.channels.get(channelName)!
  }

  unsubscribe(channelName: string) {
    this.channels.delete(channelName)
  }

  disconnect() {
    this.connected = false
    this.channels.clear()
    console.log("Mock Pusher disconnected")
  }
}

class MockChannel {
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(private name: string) {}

  bind(eventName: string, callback: Function) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, [])
    }
    this.eventHandlers.get(eventName)!.push(callback)
  }

  unbind(eventName: string, callback?: Function) {
    if (callback) {
      const handlers = this.eventHandlers.get(eventName) || []
      const index = handlers.indexOf(callback)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.delete(eventName)
    }
  }

  trigger(eventName: string, data: any) {
    const handlers = this.eventHandlers.get(eventName) || []
    handlers.forEach((handler) => handler(data))
  }
}

// Override Pusher with mock for demo
if (typeof window !== "undefined") {
  ;(window as any).Pusher = MockPusher
}
