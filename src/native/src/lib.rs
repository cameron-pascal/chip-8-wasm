pub mod interpreter;
mod utils;
mod wasm_platform_adapter;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

