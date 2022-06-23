/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RpcWire } from './RpcWire.ts'

export class WindowMessageRpc extends RpcWire {
  private target!: MessagePort

  public rpcStart(target: MessagePort) {
    this.rpcStop()
    this.target = target
    target.onmessage = this.rpcOnMessage as any
    target.onmessageerror = console.error
  }

  private rpcOnMessage = (e: MessageEvent) => {
    void this.rpcHandleMessage(e.data)
  }

  public rpcStop() {
    if (this.target) this.target.close()
  }

  protected rpcSocketClose(_message?: string, _code?: number): void {
    this.rpcStop()
    this.target.close()
  }

  protected async rpcSocketSend(data: Uint8Array): Promise<void> {
    this.target.postMessage(data)
  }
}
