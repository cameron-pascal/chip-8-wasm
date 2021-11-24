use wasm_bindgen::prelude::*;

use js_sys::{Array, Object, Reflect, Uint8Array};
use web_sys::KeyboardEvent;

use chip_8_core::{interpreter, keycodes::KeyCodes, opcode, opcode::DecodedInstruction};
use interpreter::Chip8Interpreter;

use crate::{utils::set_panic_hook, wasm_platform_adapter::WasmPlatformAdapter};

#[wasm_bindgen]
pub struct Interpreter {
    interpreter: Chip8Interpreter<WasmPlatformAdapter>,
    step_number: u64,
    last_instr: DecodedInstruction,
}

#[wasm_bindgen]
impl Interpreter {

    #[wasm_bindgen(constructor)]
    pub fn new(rom_data: &[u8]) -> Self {
        set_panic_hook(); // This allows us to log panics in the browser console.

        Interpreter {
            interpreter: Chip8Interpreter::new(WasmPlatformAdapter::new(),rom_data.to_vec()).unwrap(),
            step_number: 0,
            last_instr: DecodedInstruction::new(),
        }
    }
    
    pub fn step(&mut self, tick_rate: f64) {
        self.last_instr = self.interpreter.step(tick_rate as u64).unwrap();
        self.step_number += 1;
    }

    #[wasm_bindgen(js_name = fillDisplayBuffer)]
    pub fn fill_display_buffer(&self, buffer: &Uint8Array) {
        let mut idx = 0;
        for line in self.interpreter.display_buffer.iter() {
            for pixel in line.iter() {
                buffer.set_index(idx, *pixel);
                idx += 1;
            }
        }
    }

    #[wasm_bindgen(js_name = getXRes)]
    pub fn get_x_res() -> usize {
        interpreter::RES_X
    }

    #[wasm_bindgen(js_name = getYRes)] // Would like to use a getter here, but wasm-pack explodes when we try.
    pub fn get_y_res() -> usize {
        interpreter::RES_Y
    }

    #[wasm_bindgen(js_name = registerKeyDown)]
    pub fn register_key_down(&mut self, code: String) {
        self.interpreter.key_press = match code.as_str() {
            "Digit1" => Some(KeyCodes::Key1),
            "Digit2" => Some(KeyCodes::Key2),
            "Digit3" => Some(KeyCodes::Key3),
            "Digit4" => Some(KeyCodes::KeyC),
            "KeyQ" => Some(KeyCodes::Key4),
            "KeyW" => Some(KeyCodes::Key5),
            "KeyE" => Some(KeyCodes::Key6),
            "KeyR" => Some(KeyCodes::KeyD),
            "KeyA" => Some(KeyCodes::Key7),
            "KeyS" => Some(KeyCodes::Key8),
            "KeyD" => Some(KeyCodes::Key9),
            "KeyF" => Some(KeyCodes::KeyE),
            "KeyZ" => Some(KeyCodes::KeyA),
            "KeyX" => Some(KeyCodes::Key0),
            "KeyC" => Some(KeyCodes::KeyB),
            "KeyV" => Some(KeyCodes::KeyF),
            _ => None,
        };
    }

    #[wasm_bindgen(js_name = registerKeyUp)]
    pub fn register_key_up(&mut self, code: String) {
        let keycode = match code.as_str() {
            "Digit1" => Some(KeyCodes::Key1),
            "Digit2" => Some(KeyCodes::Key2),
            "Digit3" => Some(KeyCodes::Key3),
            "Digit4" => Some(KeyCodes::KeyC),
            "KeyQ" => Some(KeyCodes::Key4),
            "KeyW" => Some(KeyCodes::Key5),
            "KeyE" => Some(KeyCodes::Key6),
            "KeyR" => Some(KeyCodes::KeyD),
            "KeyA" => Some(KeyCodes::Key7),
            "KeyS" => Some(KeyCodes::Key8),
            "KeyD" => Some(KeyCodes::Key9),
            "KeyF" => Some(KeyCodes::KeyE),
            "KeyZ" => Some(KeyCodes::KeyA),
            "KeyX" => Some(KeyCodes::Key0),
            "KeyC" => Some(KeyCodes::KeyB),
            "KeyV" => Some(KeyCodes::KeyF),
            _ => None,
        };

        if self.interpreter.key_press == keycode {
            self.interpreter.key_press = None;
        }
    }

    #[wasm_bindgen(js_name = decodeInstruction)]
    pub fn decode_instruction(&self, instr: u16) -> JsValue {
        let decoded_instr = opcode::decode(instr, self.interpreter.quirks).mnemonic;

        JsValue::from(decoded_instr)
    }

    #[wasm_bindgen(js_name = dumpState)]
    pub fn dump_state(&self) -> JsValue {
        let state_obj: JsValue = Object::new().into();

        let registers_obj: JsValue = Object::new().into();
        Reflect::set(&registers_obj, &JsValue::from("v"), &self.dump_v_regs()).unwrap();
        Reflect::set(&registers_obj, &JsValue::from("i"), &self.dump_i_reg()).unwrap();
        Reflect::set(&registers_obj, &JsValue::from("pc"), &self.dump_program_counter()).unwrap();
        Reflect::set(&registers_obj, &JsValue::from("dt"), &self.dump_delay_timer()).unwrap();
        Reflect::set(&registers_obj, &JsValue::from("st"), &self.dump_sound_timer()).unwrap();

        let instr_data_obj: JsValue = Object::new().into();
        Reflect::set(&instr_data_obj, &JsValue::from("opcode"), &JsValue::from(*&self.last_instr.instr)).unwrap();
        Reflect::set(&instr_data_obj, &JsValue::from("mnemonic"), &JsValue::from(&self.last_instr.mnemonic)).unwrap();

        Reflect::set(&state_obj, &JsValue::from("stepNumber"), &JsValue::from(*&self.step_number as f64)).unwrap();
        Reflect::set(&state_obj, &JsValue::from("instruction"), &instr_data_obj).unwrap();
        Reflect::set(&state_obj, &JsValue::from("registers"), &registers_obj).unwrap();
        Reflect::set(&state_obj, &JsValue::from("stack"), &self.dump_stack()).unwrap();
        Reflect::set(&state_obj, &JsValue::from("memory"), &self.dump_memory()).unwrap();

        state_obj
    }

    fn dump_memory(&self) -> JsValue {
        let mem_arr = Array::new_with_length(self.interpreter.memory.len() as u32);

        for (idx, mem_val) in self.interpreter.memory.iter().enumerate() {
            mem_arr.set(idx as u32, JsValue::from(*mem_val));
        }

        JsValue::from(mem_arr)
    }

    fn dump_v_regs(&self) -> JsValue {
        let v_regs = Array::new_with_length(16);
        for (idx, v_reg) in self.interpreter.v_regs.iter().enumerate() {
            v_regs.set(idx as u32, JsValue::from(*v_reg));
        }

        JsValue::from(v_regs)
    }

    fn dump_stack(&self) -> JsValue {

        let array = Array::new();

        match self.interpreter.stack.snapshot() {
            Some(snapshot) => {
                for val in snapshot.iter() {
                    array.push(&JsValue::from(*val));
                }
            }
            _ => ()
        }

        JsValue::from(array)
    }

    fn dump_delay_timer(&self) -> JsValue {
        JsValue::from(self.interpreter.delay_timer.current_val)
    }

    fn dump_sound_timer(&self) -> JsValue {
        JsValue::from(self.interpreter.sound_timer.current_val)
    }

    fn dump_i_reg(&self) -> JsValue {
        JsValue::from(self.interpreter.i_reg)
    }

    fn dump_program_counter(&self) -> JsValue {
        JsValue::from(self.interpreter.pc)
    }
}