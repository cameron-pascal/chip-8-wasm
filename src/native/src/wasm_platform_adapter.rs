use chip_8_core::platform_adapter::PlatformAdapter;
use web_sys::{AudioContext, OscillatorNode, OscillatorType};
use js_sys::{Math};

pub struct WasmPlatformAdapter {
    oscillator: OscillatorNode,
    audio_context: AudioContext,
}

impl WasmPlatformAdapter {
    pub fn new() -> Self {

        let audio_context = AudioContext::new().unwrap();
        let oscillator = audio_context.create_oscillator().unwrap();
        oscillator.set_type(OscillatorType::Square);
        oscillator.frequency().set_value(293.665);
        oscillator.start().unwrap();
        
        WasmPlatformAdapter {
            oscillator,
            audio_context
        }
    }
}

impl PlatformAdapter for WasmPlatformAdapter {
    fn play_sound(&mut self) {
        self.oscillator.connect_with_audio_node(&self.audio_context.destination()).unwrap();
    }

    fn pause_sound(&mut self) {
        self.oscillator.disconnect_with_audio_node(&self.audio_context.destination()).unwrap();
    }

    fn get_random_val(&self) -> u8 {
        (Math::random() * 255.0) as u8
    }
}
