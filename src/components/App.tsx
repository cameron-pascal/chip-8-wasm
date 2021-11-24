import { FC, useEffect, useRef, useState } from 'react';
import { Interpreter } from '../native/pkg';
import RomSelector from './RomSelector';
import Registers from './Registers';
import { Runner, InterpreterDump } from './Runner';
import Disassembly from './Disassembly';
import { StyleSheet, css } from 'aphrodite/no-important';
import Stack from './Stack';
import Controls from './Controls';
import PlayPauseButton from './PlayPauseButton';

interface InterpreterWasmModule {
  default: typeof import('../native/pkg');
  Interpreter: typeof Interpreter;
}

const styles = StyleSheet.create({

  marginRight1Rem: {
    marginRight: '1rem'
  },

  marginTop1Rem: {
    marginTop: '1rem'
  },

  marginRight2Rem: {
    marginRight: '2rem'
  },

  flexHorizontal: {
    display: 'flex',
    flexDirection: 'row'
  },

  flexVertical: {
    display: 'flex',
    flexDirection: 'column'
  },

  alignCenter: {
    alignItems: 'center'
  },

  alignFlexStart: {
    alignItems: 'flex-start'
  }
});

const App: FC = () => {

  const [interpreterWasmModule, setInterpreterWasmModule] = useState<InterpreterWasmModule>();
  const [interpreter, setInterpreter] = useState<Interpreter>();
  const [interpreterDump, setInterpreterDump] = useState<InterpreterDump>();
  const [paused, setPaused] = useState<boolean>(true);

  const xRes = 64;
  const yRes = 32;
  const scalingFactor = 12;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<Runner>(new Runner({
    canvasRef: canvasRef,
    interpreter: interpreter,
    xRes: xRes,
    yRes: yRes,
    scalingFactor: scalingFactor,
    pixelOnColor: '#be739a',
    pixelOffColor: '#333333',
    tickRate: 540,
  }));

  useEffect(() => {
    import('../native/pkg').then(wasmMod => {
      setInterpreterWasmModule(wasmMod);
    });
  }, []);
  
  const handlePauseButtonClick = (newVal: boolean) => {
    const runner = runnerRef.current;

    if (newVal) {
      runner.stop();
      setInterpreterDump(runner.dump());
    } else {
      runner.start();
    }

    setPaused(newVal);
  };

  const handleRomDataChanged = (romData: ArrayBuffer) => {
    if (interpreterWasmModule) {
      const newInterpreter = new interpreterWasmModule.Interpreter(new Uint8Array(romData));
      window.onkeydown = (ev) => newInterpreter.registerKeyDown(ev.code);
      window.onkeyup = (ev) => newInterpreter.registerKeyUp(ev.code);

      if (!paused) {
        setPaused(true);
      }

      setInterpreter(newInterpreter);

      const runner = runnerRef.current;
      runner.interpreter = newInterpreter;

      setInterpreterDump(runner.dump());
    }
  };

  const handleStep = () => {

    const runner = runnerRef.current;
    runner.step();
    setInterpreterDump(runner.dump());
  };

  return (
    <>
        <div className={css(styles.flexHorizontal, styles.alignCenter)}>
          <h1 className={css(styles.marginRight1Rem)}>CHIP-8</h1>
          <RomSelector onRomDataChanged={(rom) => handleRomDataChanged(rom)} />
          <PlayPauseButton size="1.4rem" margin="0 0 0 1rem" paused={paused} onClick={() => handlePauseButtonClick(!paused)} />
          <button disabled={!interpreter || !paused} onClick={() => handleStep()}>{'Step'}</button>
        </div>
        {interpreter && 
          <div className={css(styles.flexVertical, styles.alignFlexStart)}>
            <div className={css(styles.flexHorizontal)}>
              <div className={css(styles.flexVertical, styles.alignCenter, styles.marginRight1Rem)}>
                <canvas ref={canvasRef} width={xRes * scalingFactor} height={yRes * scalingFactor}></canvas>
                <div className={css(styles.marginTop1Rem)}>
                  <Controls interpreter={interpreter}/>
                </div>
              </div>
              {interpreterDump?.registers &&
                <div className={css(styles.flexHorizontal)}>
                  <Registers className={css(styles.marginRight2Rem)} registerDump={interpreterDump.registers} />
                  <Stack className={css(styles.marginRight2Rem)}  stack={interpreterDump.stack} />
                  <Disassembly interpreter={interpreter} interpeterDump={interpreterDump} />
                </div>
              }
            </div>
          </div>
        }
       
      </>
  );
};

export default App;

/*
<div className={css(styles.flexHorizontal)}>
              <p>
                This is an implementation of the <a href="https://en.wikipedia.org/wiki/CHIP-8">CHIP-8</a> built with Rust, WebAssembly, TypeScript, and React.
                <br/>
                <br/>

                The CHIP-8 is a virtual machine created in 1978 by Joseph Weisbecker 
                for the <a href="https://en.wikipedia.org/wiki/COSMAC_VIP">COSMAC VIP</a> with:
                <ul>
                  <li>4096 bytes of memory.</li>
                  <li>16 8-bit registers ('V0-VF').</li>
                  <li>A 16-bit address register ('I').</li>
                  <li>A delay timer ('DT') that decrements at a rate of 60Hz.</li>
                  <li>A sound timer ('ST') that decrements at a rate of 60Hz and beeps until its value is zero.</li>
                  <li>A 36 instruction language.</li>
                </ul>
                <br/>
                The CHIP-8 has 16 input keys arranged in a 4x4 array:
                <br/>
                <br/>
                <Controls />
                <br />
               
              </p>
              
            </div>*/