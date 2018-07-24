import {Feature, FeatureMeta, FeatureType} from "./feature";
import {utils} from "./utils";
import {Manager} from "./manager";
import {log, debug} from "./log";

const announcePrefix = "announce/";

export declare type ValueCallback = (device: Device, feature: string|FeatureType, value: string) => any

export declare interface DeviceMetaReachable extends DeviceMeta {
    reachable?: boolean
}

export declare interface DeviceMeta {
    name: string;
    type: DeviceType|string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    feature?: {[type: string]: FeatureMeta};
    lastWillID?: string;
}

export class Device {

    private manager: Manager;
    private topic: string;
    private name: string;
    private type: string;
    private reachable: boolean;
    private meta: DeviceMeta;
    private feature: {[name: string]: Feature} = {};

    constructor(topic: string, opts: DeviceMetaReachable) {
        this.topic = topic;
        this.updateDevice(opts);
    }

    public addFeature(type: string|FeatureType, opts: FeatureMeta) {
        let fName = utils.typeName(type, FeatureType);
        let curFt = this.feature[fName];
        if (typeof curFt !== "undefined") {
            curFt.opts = opts;
            return;
        }
        let feature = new Feature();
        feature.opts = opts;
        this.feature[fName] = feature;
    }

    public validate(): boolean {
        if (!this.meta || typeof(this.meta) !== "object") {
            throw new Error("Device meta not instantiated");
        }
        if (!this.topic) {
            throw new Error("Device topic cannot be empty");
        }
        if (!this.name) {
            throw new Error("Deivce name cannot be empty");
        }
        if (!this.type || !utils.typeName(this.type, DeviceType)) {
            throw new Error("Invalid or missing device type");
        }
        if (!this.feature || typeof(this.feature) !== "object" || Object.keys(this.feature).length === 0) {
            throw new Error("No features exists on device");
        }
        let res = true;
        for (let k in this.feature) {
            let fName = utils.typeName(k, FeatureType);
            if (k !== fName) {
                throw new Error("Invalid feature, "+k+" != "+fName)
            }
        }

        return res;
    }

    public updateMeta() {
        this.manager.publish(announcePrefix + this.topic, this.metaJson(), {qos: 1, retain: true});
    }

    public updateDevice(opts: DeviceMetaReachable) {
        if (opts && typeof opts === "object") {
            this.name = opts.name;
            this.type = utils.typeName(opts.type, DeviceType);
            if (typeof opts.reachable !== 'undefined') {
                this.reachable = opts.reachable;
                opts.reachable = undefined;
            }
            let curFeatures = {};
            for (let k in this.feature) {
                if (!this.feature.hasOwnProperty(k)) continue;
                curFeatures[k] = true;
            }
            this.meta = opts;
            if (opts.feature && typeof opts.feature === "object") {
                for (let k in opts.feature) {
                    this.addFeature(k, opts.feature[k]);
                    delete curFeatures[k];
                }
            }
            for (let k in curFeatures) {
                if (!curFeatures.hasOwnProperty(k)) continue;
                delete this.feature[k];
            }
        }
    }

    public setManager(manager: Manager, isClient?: boolean) {
        if (this.manager !== undefined) {
            throw new Error("Manager already set");
        }
        this.manager = manager;
        for (let f in this.feature) {
            let ftName = f;
            let ft = this.feature[ftName];
            let ftTopic = isClient ? this.setTopicName(ftName) : this.getTopicName(ftName);
            manager.subscribe(ftTopic, (topic, payload, packet) => {
                let list = isClient ? ft.setCallbacks : ft.getCallbacks;
                if (list === undefined) {
                    return;
                }
                for (let i in list) {
                    list[i](this, ftName, payload.toString());
                }
            });
        }
    }

    public topicName(): string {
        return this.topic;
    }

    public metaJson(): string {
        this.validate();
        const o = {};
        o["name"] = this.name;
        o["type"] = utils.typeName(this.type, DeviceType);
        o["manufacturer"] = this.meta.manufacturer;
        o["model"] = this.meta.model;
        o["serialNumber"] = this.meta.serialNumber;
        o["lastWillID"] = this.meta.lastWillID;

        let features = {};
        for (let k in this.feature) {
            let typeName = utils.typeName(k, FeatureType);
            let ft = this.feature[k];
            if (!ft.opts) {
                ft.opts = {};
            }
            features[typeName] = {
                min: ft.opts.min,
                max: ft.opts.max,
                step: ft.opts.step,
                setTopic: ft.opts.setTopic,
                getTopic: ft.opts.getTopic
            };
        }
        o["feature"] = features;

        return JSON.stringify(o)
    }

    public set(feature: string|FeatureType, value: string|number|boolean, callback?) {
        if (!this.manager) {
            throw new Error("Device has not manager, unable to Set()");
        }
        if (value === true) { value = 1; }
        if (value === false) { value = 0; }
        this.manager.publish(this.setTopicName(feature), ""+value, {qos:1, retain:false, dup:false}, callback);
    }

    public update(feature: string|FeatureType, value: string|number|boolean, callback?) {
        if (!this.manager) {
            throw new Error("Device has not manager, unable to Update()");
        }
        if (value === true) { value = 1; }
        if (value === false) { value = 0; }
        this.manager.publish(this.getTopicName(feature), ""+value, {qos:1, retain:true, dup:false}, callback);
    }

    public onSet(feature: string|FeatureType, cb: ValueCallback) {
        this.getFeature(feature).onSet(cb);
    }

    public onUpdate(feature: string|FeatureType, cb: ValueCallback) {
        this.getFeature(feature).onUpdate(cb);
    }

    public getFeatures(): {[name: string]: Feature} {
        return this.feature;
    }

    public getFeature(feature: string|FeatureType): Feature {
        let fName = utils.typeName(feature, FeatureType);
        if (fName !== "" && this.feature[fName] !== undefined) {
            return this.feature[fName];
        }
        throw new Error("Feature "+feature+" is not implemented on device "+this.topic);

    }

    public setTopicName(feature: string|FeatureType): string {
        let t = this.topic + "/" + utils.typeName(feature, FeatureType) + "/set";
        let f = this.getFeature(feature);
        if (f.opts.setTopic) {
            t = f.opts.setTopic;
        }
        return t;
    }
    public getTopicName(feature: string|FeatureType): string {
        let t = this.topic + "/" + utils.typeName(feature, FeatureType) + "/get";
        let f = this.getFeature(feature);
        if (f.opts.getTopic) {
            t = f.opts.getTopic;
        }
        return t;
    }
    public getType(): string {
        return utils.typeName(this.type, DeviceType);
    }
    public getName(): string {
        return this.name;
    }
}

export enum DeviceType {
    AccessoryInformation = "3E",
    AirPurifier = "BB",
    AirQualitySensor = "8D",
    BatteryService = "96",
    BridgeConfiguration = "A1",
    BridgingState = "62",
    CameraControl = "111",
    CameraRTPStreamManagement = "110",
    CarbonDioxideSensor = "97",
    CarbonMonoxideSensor = "7F",
    ContactSensor = "80",
    Door = "81",
    Doorbell = "121",
    Fan = "40",
    FanV2 = "B7",
    FilterMaintenance = "BA",
    GarageDoorOpener = "41",
    HeaterCooler = "BC",
    HumidifierDehumidifier = "BD",
    HumiditySensor = "82",
    LeakSensor = "83",
    LightSensor = "84",
    Lightbulb = "43",
    LockManagement = "44",
    LockMechanism = "45",
    Microphone = "112",
    MotionSensor = "85",
    OccupancySensor = "86",
    Outlet = "47",
    SecuritySystem = "7E",
    Slat = "B9",
    SmokeSensor = "87",
    Speaker = "113",
    StatefulProgrammableSwitch = "88",
    StatelessProgrammableSwitch = "89",
    Switch = "49",
    TemperatureSensor = "8A",
    Thermostat = "4A",
    TimeInformation = "99",
    TunneledBTLEAccessoryService = "56",
    Window = "8B",
    WindowCovering = "8C",
}
