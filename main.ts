//% color="#D063CF" icon="\uf1b9" block="Tiny Robot"
namespace robot {
    export enum Mode {
        Safe = 0,
        Normal = 1,
        Sport = 2,
    }

    export enum Direction {
        //% blockId="Run" block="Run"
        Run = 1,
        //% blockId="Back" block="Back"
        Back = 2,
        //% blockId="Left" block="Left"
        Left = 3,
        //% blockId="Right" block="Right"
        Right = 4,
        //% blockId="Stop" block="Stop"
        Stop = 5,
        //% blockId="SpinLeft" block="SpinLeft"
        SpinLeft = 6,
        //% blockId="SpinRight" block="SpinRight"
        SpinRight = 7,
    }

    export enum Music {
        //% blockId="dadadum" block="dadadum"
        dadadum = 0,
        //% blockId="entertainer" block="entertainer"
        entertainer,
        //% blockId="prelude" block="prelude"
        prelude,
        //% blockId="ode" block="ode"
        ode,
        //% blockId="nyan" block="nyan"
        nyan,
        //% blockId="ringtone" block="ringtone"
        ringtone,
        //% blockId="funk" block="funk"
        funk,
        //% blockId="blues" block="blues"
        blues,
        //% blockId="birthday" block="birthday"
        birthday,
        //% blockId="wedding" block="wedding"
        wedding,
        //% blockId="funereal" block="funereal"
        funereal,
        //% blockId="punchline" block="punchline"
        punchline,
        //% blockId="baddy" block="baddy"
        baddy,
        //% blockId="chase" block="chase"
        chase,
        //% blockId="ba_ding" block="ba_ding"
        ba_ding,
        //% blockId="wawawawaa" block="wawawawaa"
        wawawawaa,
        //% blockId="jump_up" block="jump_up"
        jump_up,
        //% blockId="jump_down" block="jump_down"
        jump_down,
        //% blockId="power_up" block="power_up"
        power_up,
        //% blockId="power_down" block="power_down"
        power_down,
    }

    export enum Colors {
        //% block=red
        Red = 0xff0000,
        //% block=orange
        Orange = 0xffa500,
        //% block=yellow
        Yellow = 0xffff00,
        //% block=green
        Green = 0x00ff00,
        //% block=blue
        Blue = 0x0000ff,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xff00ff,
        //% block=white
        White = 0xffffff,
        //% block=black
        Black = 0x000000,
    }

    export enum IRState {
        //% blockId="White" block="White Line"
        White = 0,
        //% blockId="Black" block="Black Line"
        Black = 1,
    }

    enum State {
        Idle,
        Moving,
    }

    let _state: State = State.Idle;
    let _mode: Mode = Mode.Safe;
    let _speed: number = 125; // 0 .. 255
    let _maxSpeed = 150;
    let _stepUnit: number = 200; // ms
    let _maxStep = 3;

    //% block
    //% step.defl=1
    //% group="Drive"
    export function move(direction?: Direction, step?: number) {
        motorRun(direction, step);
    }

    //% block
    //% group="Drive"
    export function tank(leftSpeed: number, rightSpeed?: number) {
        motorTank(leftSpeed, rightSpeed || leftSpeed);
    }

    //% block
    //% group="Drive"
    export function stop() {
        setPwmMotor(5, 0, 0);
    }

    //% block
    //% group="Light"
    export function lightBack(color?: Colors) {
        showBackLED(color);
    }

    //% block
    //% group="Light"
    export function lightFront(color?: Colors) {
        showFrontLED(color);
    }

    //% block
    //% group="Music"
    export function playMusic(music: Music) {
        Tinybit.Music_Car(music as any);
    }

    //% block
    //% group="Sensors"
    export function getObstacleDistance(): number {
        return Tinybit.Ultrasonic_CarV2();
    }

    //% block
    //% group="Sensors"
    export function isIrLeft(state: IRState): boolean {
        return Tinybit.Line_Sensor(Tinybit.enPos.LeftState, state as any);
    }

    //% block
    //% group="Sensors"
    export function isIrRight(state: IRState): boolean {
        return Tinybit.Line_Sensor(Tinybit.enPos.RightState, state as any);
    }

    //% block
    //% maxSpeed.defl=150
    //% maxSpeed.min=0 maxSpeed.max=255
    //% group="Setters"
    export function setMaxSpeed(maxSpeed: number) {
        _maxSpeed = maxSpeed;
    }

    //% block
    //% maxStep.defl=3
    //% maxStep.min=1 maxStep.max=5
    //% group="Setters"
    export function setMaxStep(maxStep: number) {
        _maxStep = maxStep;
    }

    //% block
    //% speed.defl=70
    //% speed.min=0 speed.max=255
    //% group="Setters"
    export function setSpeed(speed: number) {
        _speed = speed;
    }

    //% block
    //% mode.defl='safe'
    //% group="Setters"
    export function setMode(mode: Mode) {
        _mode = mode;
    }

    // helpers
    // ----------

    function motorRun(direction = Direction.Run, step = 1) {
        if (_mode === Mode.Safe) {
            Tinybit.CarCtrlSpeed(direction as any, _speed);
            basic.pause(Math.min(step, _maxStep) * _stepUnit);
            Tinybit.CarCtrl(Tinybit.CarState.Car_Stop);
        } else if (_mode === Mode.Normal) {
            Tinybit.CarCtrlSpeed(direction as any, Math.min(_speed, _maxSpeed));
        } else {
            Tinybit.CarCtrlSpeed(direction as any, _speed);
        }
    }

    function motorTank(left: number, right: number, step = 1) {
        const spin = Math.sign(left) != Math.sign(right);
        if (left === 0 && right === 0) setPwmMotor(0, 0, 0);
        else if (left >= 0 && right >= 0) setPwmMotor(1, left, right, step);
        else if (left <= 0 && right <= 0) setPwmMotor(2, -left, -right, step);
        else if (right > left) {
            if (spin) setPwmMotor(6, Math.abs(left), right, step);
            else setPwmMotor(3, Math.abs(left), right, step);
        } else {
            if (spin) setPwmMotor(7, left, Math.abs(right), step);
            else setPwmMotor(4, left, Math.abs(right), step);
        }
    }

    function setPwmMotor(d: number, speed1: number, speed2: number, step = 1) {
        if (d < 0 || d > 7) return;

        if (_mode === Mode.Safe) {
            Tinybit.CarCtrlSpeed2(d, speed1, speed2);
            basic.pause(Math.min(step, _maxStep) * _stepUnit);
            Tinybit.CarCtrl(Tinybit.CarState.Car_Stop);
        } else if (_mode === Mode.Normal) {
            speed1 = Math.sign(speed1) * Math.min(Math.abs(speed1), _maxSpeed);
            speed2 = Math.sign(speed2) * Math.min(Math.abs(speed2), _maxSpeed);
            Tinybit.CarCtrlSpeed2(d, speed1, speed2);
        } else {
            Tinybit.CarCtrlSpeed2(d, speed1, speed2);
        }
    }

    function showBackLED(c?: Colors): void {
        if (!c) {
            Tinybit.RGB_Car_Program().showColor(0);
        } else {
            Tinybit.RGB_Car_Program().showColor(neopixel.colors(c as any) as any);
        }
        Tinybit.RGB_Car_Program().show();
    }

    function showFrontLED(c?: Colors): void {
        if (!c) {
            Tinybit.RGB_Car_Big2(0, 0, 0);
        } else {
            c = c >> 0;
            const { red, green, blue } = setAllRGB(c);
            Tinybit.RGB_Car_Big2(red, green, blue);
        }
    }

    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xff;
        return r;
    }

    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xff;
        return g;
    }

    function unpackB(rgb: number): number {
        let b = rgb & 0xff;
        return b;
    }

    function setAllRGB(rgb: number) {
        let red = unpackR(rgb);
        let green = unpackG(rgb);
        let blue = unpackB(rgb);
        return { red, green, blue };
    }
}
