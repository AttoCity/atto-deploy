import { connectWire, reverseProtocol, WindowMessageRpc } from '@/rpc/index.ts'
import { transtreamProtocol } from './transtreamProtocol.ts'

export class TranstreamServer extends connectWire(reverseProtocol(transtreamProtocol), WindowMessageRpc) {
  public stream: ReadableStream<Uint8Array> | undefined
  private reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  private readonly channel = new MessageChannel()

  public constructor() {
    super()

    this.on.cancel = async () => {
      if (this.stream) {
        this.stream.cancel()
        this.stream = undefined
      }
      if (this.reader) {
        this.reader.cancel()
        this.reader = undefined
      }
      await this.error('cancelled')
    }

    this.on.start = async () => {
      const stream = this.stream
      if (!stream) {
        console.error('start stream not found')
        return await this.error('stream not found')
      }
    }

    this.on.pull = async () => {
      const stream = this.stream
      if (!stream) {
        console.error('pull stream not found')
        return await this.error('stream not found')
      }
      if (!this.reader) {
        this.reader = stream.getReader()
      }

      const reader = this.reader
      if (!reader) {
        return await this.error('reader not found')
      }

      const { value, done } = await reader.read()
      if (done) {
        this.stream = undefined
        this.reader = undefined
        await this.close()
      } else {
        try {
          await this.enqueue(value)
        } catch (e) {
          this.stream = undefined
          this.reader = undefined
          await this.error(e.message)
        }
      }
    }

    this.rpcStart(this.channel.port1)
  }

  public putStream(stream: ReadableStream<Uint8Array>) {
    this.stream = stream
  }

  public get remotePort() {
    return this.channel.port2
  }
}
