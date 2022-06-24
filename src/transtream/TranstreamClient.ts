/* eslint-disable @typescript-eslint/require-await */
import { connectWire, WindowMessageRpc } from '../rpc/index.ts'
import { transtreamProtocol } from './transtreamProtocol.ts'

export class TranstreamClient extends connectWire(transtreamProtocol, WindowMessageRpc) {
  private controller: ReadableByteStreamController | undefined

  public constructor(target: MessagePort) {
    super()

    this.on.close = async () => {
      const controller = this.controller
      if (controller) {
        this.controller = undefined
        controller.close()
      }
    }

    this.on.error = async (error) => {
      const controller = this.controller
      if (controller) {
        this.controller = undefined
        controller.error(new Error(error))
      }
    }

    this.on.enqueue = async (chunk) => {
      if (this.controller) {
        this.controller.enqueue(new Uint8Array(chunk))
      } else {
        throw new Error('stream not found')
      }
    }

    this.rpcStart(target)
  }

  public getStream() {
    const stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller as ReadableByteStreamController
      },
      pull: async (controller) => {
        this.controller = controller as ReadableByteStreamController
        await this.pull()
      },
      cancel: async () => {
        this.controller = undefined
        await this.cancel()
      },
    })
    return stream
  }
}
