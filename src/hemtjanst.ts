import {Device} from "./device";
import {Manager} from "./manager";
import {MqttClient} from "mqtt";

import {log, debug} from "./log";

export class Client extends Manager {

    private announce: boolean = false;
    private devices: Device[] = [];

    constructor(mqtt: MqttClient) {
        super(mqtt);
        this.devices = [];
        this.subscribe("discover", (topic, payload, packet) => {
            this.onDiscover();
        });
    }

    public AddDevice(device: Device) {
        debug("Trying to add device");
        debug(device);
        if (this.devices.indexOf(device) == -1 && device.validate()) {
            device.setManager(this, true);
            if (this.announce) { 
                let topic = device.topicName();
                debug("Announcing device " + topic);
                this.publish("announce", topic);
            }
            this.devices.push(device);
        }
    }

    private onDiscover() {
        debug("Got discover message");
        this.announce = true;
        for (let d in this.devices) {
            let topic = this.devices[d].topicName();
            debug("Announcing device " + topic);
            this.publish("announce", topic);
        }
    }

}
export class Server extends Manager {

    private devices: Device[] = [];

    constructor(mqtt :MqttClient) {
        super(mqtt);
        this.subscribe("announce", (topic, payload, packet) => {
            this.onAnnounce(payload.toString());
        });
        this.publish("discover", "1", {qos: 1, retain: true, dup: false});
    }

    private onAnnounce(topic: string) {

    }


}
