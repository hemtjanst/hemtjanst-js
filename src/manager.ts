export declare interface Buffer {
    toString: () => string
}

import {IClientPublishOptions, ISubscriptionGrant, MqttClient, OnMessageCallback, Packet, PacketCallback} from "mqtt";

import {log, debug} from "./log";

export class Manager {

    protected mqtt: MqttClient;
    private subscriptions: Subscription[] = [];

    constructor(mqtt: MqttClient) {
        this.mqtt = mqtt;
        this.subscriptions = [];
        mqtt.on("message", (t,p,a) => { this.onMessage(t,p,a); });
    }

    public publish(topic: string, value: string | Buffer, opts?: IClientPublishOptions, callback?: PacketCallback): this {
        debug("Publishing to "+topic+": "+value.toString());
        this.mqtt.publish(topic, value, opts, callback);
        return this;
    }

    public subscribe(topic: string, callback: OnMessageCallback): string {
        debug("Subscribing to "+topic);
        for (let i in this.subscriptions) {
            let s = this.subscriptions[i];
            if (s.topic === topic) {
                s.addCallback(callback);
                return;
            }
        }
        let s = new Subscription(topic, this.mqtt);
        s.addCallback(callback);
        this.subscriptions.push(s)
    }

    private onMessage(topic: string, payload: Buffer, packet: Packet) {
        debug("Got message on "+topic+": "+payload.toString());
        for (let i in this.subscriptions) {
            this.subscriptions[i].onMessage(topic, payload, packet);
        }
    }

}

class Subscription {
    public mqtt: MqttClient;
    public topic: string;
    public started: boolean = false;
    public successful: boolean = false;
    public callbacks: OnMessageCallback[] = [];

    constructor (topic: string, mqtt?: MqttClient) {
        this.topic = topic;
        this.mqtt = mqtt;
    }

    public start() {
        if (this.started) {
            return;
        }
        this.started = true;
        this.mqtt.subscribe(this.topic, {qos: 1}, (err: Error, granted: ISubscriptionGrant[]) => {
            for (let k in granted) {
                if (granted[k].topic === this.topic) {
                    this.successful = true;
                    return;
                }
            }
            this.started = false;
            this.successful = false;
        });
    }

    public addCallback(callback: OnMessageCallback) {
        this.callbacks.push(callback);
        this.start();
    }

    public onMessage(topic: string, payload: Buffer, packet: Packet) {
        if (topic !== this.topic) {
            return;
        }
        for (let i in this.callbacks) {
            this.callbacks[i](topic, payload, packet)
        }
    }
}