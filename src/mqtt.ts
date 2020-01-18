
export declare type QoS = 0 | 1 | 2
export declare type ClientSubscribeCallback = (err: Error, granted: ISubscriptionGrant[]) => void
export declare type OnMessageCallback = (topic: string, payload: Buffer, packet: any) => void
export declare type PacketCallback = (error?: Error, packet?: Packet) => any

export interface ISubscriptionGrant {
    topic: string
    qos: QoS | number
}
export interface Packet {
    cmd: string
    [opt: string]: any
}

export interface IClientPublishOptions {
    qos: QoS
    retain?: boolean
    dup?: boolean
}
export interface IClientSubscribeOptions {
    qos: QoS
}


export interface MqttClient {
    on (event: 'message', cb: OnMessageCallback): this
    publish (topic: string, message: string | Buffer,
                    opts: IClientPublishOptions, callback?: PacketCallback): this
    publish (topic: string, message: string | Buffer,
                    callback?: PacketCallback): this

    subscribe (topic:
                          string
                          | string[], opts: IClientSubscribeOptions, callback?: ClientSubscribeCallback): this

    unsubscribe (topic: string | string[], callback?: PacketCallback): this
}
