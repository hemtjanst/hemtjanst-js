/// <reference types="node" />

import {Device} from "./device";

import {IClientPublishOptions, ISubscriptionGrant, MqttClient, OnMessageCallback, Packet, PacketCallback} from "mqtt";

import {log, debug} from "./log";

export abstract class Manager {

    protected announce: boolean = false;
    protected devices: Device[] = [];
    protected mqtt: MqttClient;
    protected abstract isClient: boolean;
    private subscriptions: Subscription[] = [];

    constructor(mqtt: MqttClient) {
        this.devices = [];
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

    public AddDevice(device: Device) {
        debug("Trying to add device");
        debug(device);
        if (this.devices.indexOf(device) == -1 && device.validate()) {
            device.setManager(this, this.isClient);
            if (this.announce && this.isClient) {
                device.updateMeta()
            }
            this.devices.push(device);
        }
    }

    protected getDevice(topic: string): Device {
        for (let i in this.devices) {
            if (this.devices[i].topicName() === topic) {
                return this.devices[i];
            }
        }
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
        let wildcardMatch = false;
        if (this.topic.substr(-1,1) === "#") {
            if (this.topic.substr(0,this.topic.length-1) == topic.substr(0, this.topic.length-1)) {
                wildcardMatch = true;
            }
        }
        if (this.topic.indexOf("+") >= 0) {
            wildcardMatch = true;
            let thsp = this.topic.split("/");
            let tosp = topic.split("/");
            if (thsp.length != tosp.length) {
                wildcardMatch = false;
            } else {
                for (let k in thsp) {
                    if (thsp[k] == "+" || thsp[k] == tosp[k]) {
                        continue;
                    }
                    wildcardMatch = false;
                    break;
                }
            }
        }

        if (!wildcardMatch && topic !== this.topic) {
            return;
        }
        for (let i in this.callbacks) {
            this.callbacks[i](topic, payload, packet)
        }
    }
}