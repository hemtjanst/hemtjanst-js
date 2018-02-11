import {Device} from "./device";
import {Manager} from "./manager";
import {MqttClient} from "mqtt";

import {log, debug} from "./log";

export class Client extends Manager {
    isClient: boolean = true;

    constructor(mqtt: MqttClient) {
        super(mqtt);
        this.subscribe("discover", (topic, payload, packet) => {
            this.onDiscover();
        });
    }

    private onDiscover() {
        debug("Got discover message");
        this.announce = true;
        for (let d in this.devices) {
            let topic = this.devices[d].topicName();
            try {
                if (this.devices[d].validate()) {
                    debug(`Announcing device ${topic}`);
                    this.devices[d].updateMeta();
                }
            } catch (err) {
                log(`Failed to announce device ${topic}: `, err)
            }
        }
    }

}
export class Server extends Manager {
    isClient: boolean = false;
    onDevice: ((any) => any)[] = [];

    constructor(mqtt :MqttClient) {
        super(mqtt);
        this.subscribe("announce/#", (topic, payload, packet) => {
            this.onAnnounce(topic.substr(9), payload.toString());
        });
        this.publish("discover", "1", {qos: 1, retain: true, dup: false});
    }

    private onAnnounce(topic: string, json: string) {
        let meta = JSON.parse(json);
        let oldDev = this.getDevice(topic);
        if (typeof oldDev !== "undefined") {
            oldDev.updateDevice(meta);
            return;
        }
        let device = new Device(topic, meta);
        device.setManager(this, false);
        this.devices.push(device);
        this.onDevice.forEach(v => {
            v(device);
        })
    }

    on(ev: string, cb: (any) => any) {
        if (ev == "device") {
            this.onDevice.push(cb);
            this.devices.forEach(cb);
        }
    }


}
