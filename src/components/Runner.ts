import { RefObject } from 'react';
import { Interpreter } from '../native/pkg';

class FramerateEstimator {

    private frameWindowSize: number = 3;
    private countFrames: number = 0;
    private lastFrameTime: number = 0;
    private accumulatedFrameTime: number = 0;
    private frameRateRunningAverage: number = 60;

    public markFrame(frameStart: number) {

        if (this.countFrames > 0) { 
            const delta = frameStart - this.lastFrameTime;
            this.accumulatedFrameTime += delta;
            
            if (this.countFrames === this.frameWindowSize) {
                this.frameRateRunningAverage = Math.round(1000 / (this.accumulatedFrameTime / this.countFrames));
                this.countFrames = 0;
                this.accumulatedFrameTime = 0;
            }
        }

        this.lastFrameTime = frameStart;
        this.countFrames++;
    }

    public reset() {
        this.countFrames = 0;
        this.lastFrameTime = 0;
        this.accumulatedFrameTime = 0;
        this.frameRateRunningAverage = 60;
    }

    public get averageFrameRate() {
        return this.frameRateRunningAverage;
    }
}

export interface RegisterDump {
    i: number,
    pc: number,
    v: number[],
    dt: number,
    st: number,
}

export interface InstructionDump {
    mnemonic: string,
    opcode: number
}

export interface InterpreterDump {
    step_count: number,
    instruction: InstructionDump,
    registers: RegisterDump,
    stack: number[]
    memory: number[]
}

export interface RunnerParams {
    canvasRef: RefObject<HTMLCanvasElement>
    interpreter?: Interpreter,
    scalingFactor: number,
    xRes: number,
    yRes: number,
    pixelOnColor: string,
    pixelOffColor: string,
    tickRate: number
}

export class Runner {
    private animationRequest?: number;
    private currSecStart?: number;
    private remainingFramesCurrSec?: number;
    private canvasRef: RefObject<HTMLCanvasElement>;
    private framerateEstimator: FramerateEstimator;
     private displayBuffer: Uint8Array;

    public tickRate: number;
    public scalingFactor: number;
    public xRes: number;
    private yRes: number;
    public pixelOnColor: string;
    public pixelOffColor: string;
    private interpreterField?: Interpreter; 


    public get interpreter(): Interpreter | undefined {
        return this.interpreterField;
    }

    public set interpreter(newIntepreter: Interpreter | undefined) {
        this.stop();
        this.interpreterField = newIntepreter;

        const canvas = this.canvasRef.current;
        if (canvas) {
            const renderingContext = canvas?.getContext('2d');
            if (renderingContext) {
                renderingContext.fillStyle = this.pixelOffColor;
                renderingContext.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    constructor(params: RunnerParams) {
        this.canvasRef = params.canvasRef;
        this.tickRate = params.tickRate;
        this.scalingFactor = params.scalingFactor;
        this.xRes = params.xRes;
        this.yRes = params.yRes;
        this.pixelOnColor = params.pixelOnColor;
        this.pixelOffColor = params.pixelOffColor;
        this.interpreterField = params.interpreter;

        this.framerateEstimator = new FramerateEstimator();
        this.displayBuffer = new Uint8Array(this.xRes * this.yRes);
    }

    public start() {
        this.reset();
        this.animationRequest = window.requestAnimationFrame((t) => this.renderFrame(t));
    }

    public stop() {
        if (this.animationRequest) {
            window.cancelAnimationFrame(this.animationRequest);
            this.animationRequest = undefined;
        }
    }

    public step() {
        const renderingContext = this.canvasRef.current?.getContext('2d');
        const interpreter = this.interpreter;

        if (!renderingContext || !interpreter) {
            return;
        }

        if (!this.animationRequest) {
            interpreter.step(this.tickRate);
            this.drawFrame(interpreter, renderingContext);
        }
    }

    public dump() {
        const interpreter = this.interpreter;

        if (!interpreter) {
            return;
        }

        return interpreter.dumpState() as InterpreterDump;
    }

    private reset() {
        this.currSecStart = 0;
        this.remainingFramesCurrSec = 0;
        this.framerateEstimator.reset();
    }

    private renderFrame(frameStart: number) {

        this.framerateEstimator.markFrame(frameStart);
        const renderingContext = this.canvasRef.current?.getContext('2d');
        const interpreter = this.interpreter;

        if (!renderingContext || !interpreter) {
            return;
        }

        const tickRate = this.tickRate;

        if (renderingContext) {
            if (frameStart - (this.currSecStart ?? 0) >= 1000) {
                this.currSecStart = frameStart;
                this.remainingFramesCurrSec = tickRate;
            }

            if (this.remainingFramesCurrSec! > 0) {

                const stepsPerFrame = Math.round(tickRate / this.framerateEstimator.averageFrameRate);
                const stepsThisFrame = Math.min(this.remainingFramesCurrSec!, stepsPerFrame);
                
                for (let i = 0; i < stepsThisFrame; i++) {
                    interpreter.step(tickRate);
                }

                this.drawFrame(interpreter, renderingContext);

                this.remainingFramesCurrSec! -= stepsThisFrame;
                Math.abs(this.remainingFramesCurrSec!);
            }

            this.animationRequest = window.requestAnimationFrame((t) => this.renderFrame(t));
        }
    }

    private drawFrame(interpreter: Interpreter, renderingContext: CanvasRenderingContext2D) {
        interpreter.fillDisplayBuffer(this.displayBuffer);

        let idx = 0;
        for (let y = 0; y < this.yRes; y++) {
            for (let x = 0; x < this.xRes; x++) {
                const pixel = this.displayBuffer[idx++];
                renderingContext.fillStyle = pixel ? this.pixelOnColor : this.pixelOffColor;
    
                renderingContext.fillRect(
                    x * this.scalingFactor, 
                    y * this.scalingFactor, 
                    this.scalingFactor, 
                    this.scalingFactor);
            }
        }
    };
}