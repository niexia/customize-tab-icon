import {defineExtensionMessaging} from "@webext-core/messaging"

interface ProtocoMap {
  getWebsiteIcon(icon: string): void
  setWebsiteIcon(icon: string): boolean
  requestWebsiteIcon(): boolean
}

export const {sendMessage, onMessage, removeAllListeners} = defineExtensionMessaging<ProtocoMap>()