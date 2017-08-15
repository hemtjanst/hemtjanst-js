
import {ValueCallback} from "./device";
export declare interface FeatureMeta {
    min?: number;
    max?: number;
    step?: number;
    setTopic?: string;
    getTopic?: string;
}

export class Feature {
    public getCallbacks?: ValueCallback[] = [];
    public setCallbacks?: ValueCallback[] = [];
    public opts: FeatureMeta;

    public onSet(cb: ValueCallback): this {
        if (!this.setCallbacks) {
            this.setCallbacks = [];
        }
        this.setCallbacks.push(cb);
        return this;
    }

    public onUpdate(cb: ValueCallback): this {
        if (!this.getCallbacks) {
            this.getCallbacks = [];
        }
        this.getCallbacks.push(cb);
        return this;
    }
}

export enum FeatureType {
    AccessoryFlags = "A6",
    AccessoryIdentifier = "57",
    Active = "B0",
    AdministratorOnlyAccess = "1",
    AirParticulateDensity = "64",
    AirParticulateSize = "65",
    AirQuality = "95",
    AppMatchingIdentifier = "A4",
    AudioFeedback = "5",
    BatteryLevel = "68",
    Brightness = "8",
    CarbonDioxideDetected = "92",
    CarbonDioxideLevel = "93",
    CarbonDioxidePeakLevel = "94",
    CarbonMonoxideDetected = "69",
    CarbonMonoxideLevel = "90",
    CarbonMonoxidePeakLevel = "91",
    Category = "A3",
    ChargingState = "8F",
    ColorTemperature = "CE",
    ConfigureBridgedAccessory = "A0",
    ConfigureBridgedAccessoryStatus = "9D",
    ContactSensorState = "6A",
    CoolingThresholdTemperature = "D",
    CurrentAirPurifierState = "A9",
    CurrentAmbientLightLevel = "6B",
    CurrentDoorState = "E",
    CurrentFanState = "AF",
    CurrentHeaterCoolerState = "B1",
    CurrentHeatingCoolingState = "F",
    CurrentHorizontalTiltAngle = "6C",
    CurrentHumidifierDehumidifierState = "B3",
    CurrentPosition = "6D",
    CurrentRelativeHumidity = "10",
    CurrentSlatState = "AA",
    CurrentTemperature = "11",
    CurrentTiltAngle = "C1",
    CurrentTime = "9B",
    CurrentVerticalTiltAngle = "6E",
    DayOfTheWeek = "98",
    DigitalZoom = "11D",
    DiscoverBridgedAccessories = "9E",
    DiscoveredBridgedAccessories = "9F",
    FilterChangeIndication = "AC",
    FilterLifeLevel = "AB",
    FirmwareRevision = "52",
    HardwareRevision = "53",
    HeatingThresholdTemperature = "12",
    HoldPosition = "6F",
    Hue = "13",
    Identify = "14",
    ImageMirroring = "11F",
    ImageRotation = "11E",
    LeakDetected = "70",
    LinkQuality = "9C",
    LockControlPoint = "19",
    LockCurrentState = "1D",
    LockLastKnownAction = "1C",
    LockManagementAutoSecurityTimeout = "1A",
    LockPhysicalControls = "A7",
    LockTargetState = "1E",
    Logs = "1F",
    Manufacturer = "20",
    Model = "21",
    MotionDetected = "22",
    Mute = "11A",
    Name = "23",
    NightVision = "11B",
    NitrogenDioxideDensity = "C4",
    ObstructionDetected = "24",
    OccupancyDetected = "71",
    On = "25",
    OpticalZoom = "11C",
    OutletInUse = "26",
    OzoneDensity = "C3",
    PairSetup = "4C",
    PairVerify = "4E",
    PairingFeatures = "4F",
    PairingPairings = "50",
    PM10Density = "C7",
    PM2_5Density = "C6",
    PositionState = "72",
    ProgrammableSwitchEvent = "73",
    ProgrammableSwitchOutputState = "74",
    Reachable = "63",
    RelativeHumidityDehumidifierThreshold = "C9",
    RelativeHumidityHumidifierThreshold = "CA",
    ResetFilterIndication = "AD",
    RotationDirection = "28",
    RotationSpeed = "29",
    Saturation = "2F",
    SecuritySystemAlarmType = "8E",
    SecuritySystemCurrentState = "66",
    SecuritySystemTargetState = "67",
    SelectedStreamConfiguration = "117",
    SerialNumber = "30",
    SetupEndpoints = "118",
    SlatType = "C0",
    SmokeDetected = "76",
    SoftwareRevision = "54",
    StatusActive = "75",
    StatusFault = "77",
    StatusJammed = "78",
    StatusLowBattery = "79",
    StatusTampered = "7A",
    StreamingStatus = "120",
    SulphurDioxideDensity = "C5",
    SupportedAudioStreamConfiguration = "115",
    SupportedRTPConfiguration = "116",
    SupportedVideoStreamConfiguration = "114",
    SwingMode = "B6",
    TargetAirPurifierState = "A8",
    TargetAirQuality = "AE",
    TargetDoorState = "32",
    TargetFanState = "BF",
    TargetHeaterCoolerState = "B2",
    TargetHeatingCoolingState = "33",
    TargetHorizontalTiltAngle = "7B",
    TargetHumidifierDehumidifierState = "B4",
    TargetPosition = "7C",
    TargetRelativeHumidity = "34",
    TargetSlatState = "BE",
    TargetTemperature = "35",
    TargetTiltAngle = "C2",
    TargetVerticalTiltAngle = "7D",
    TemperatureDisplayUnits = "36",
    TimeUpdate = "9A",
    TunnelConnectionTimeout = "61",
    TunneledAccessoryAdvertising = "60",
    TunneledAccessoryConnected = "59",
    TunneledAccessoryStateNumber = "58",
    Version = "37",
    VOCDensity = "C8",
    Volume = "119",
    WaterLevel = "B5",
}