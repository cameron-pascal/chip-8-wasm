import { FC } from 'react';
import { Interpreter } from '../native/pkg';
import { InterpreterDump } from './Runner';
import Table, { Column } from './Table';

interface DisassemblyInfo {
    addr: number,
    instr: number,
    opcode: string
}

export interface MemoryDumpProps {
    interpeterDump: InterpreterDump,
    interpreter: Interpreter,
    className?: string
}

const disassemble = (props: MemoryDumpProps) => {

    const interpreterDump = props.interpeterDump;
    const memory = interpreterDump.memory;

    const memorySize = memory.length;
    const pc = interpreterDump.registers.pc;

    const pageStart = Math.max(pc - 18, 0);
    const pageEnd = Math.min(pc + 20, memorySize);

    const disassembly: DisassemblyInfo[] = [];

    for (let i = pageStart; i <= pageEnd; i+=2) {

        const hi = memory[i];
        const lo = memory[i+1];

        const instr = (hi << 8) | lo;

        if (instr !== 0) {
            const opcode = props.interpreter.decodeInstruction(instr);
            if (opcode) {
                disassembly.push({
                    addr: i,
                    instr: instr,
                    opcode: opcode,
                });
            }
        }
    }

    return disassembly;
};


const Disassembly: FC<MemoryDumpProps> = (props) => {

    const memoryInfo = disassemble(props);

    const columns: Column<DisassemblyInfo, keyof DisassemblyInfo>[] = [
        {
            header: 'address',
            key: 'addr'
        },
        {
            header: 'instruction',
            key: 'instr'
        },
        {
            header: 'opcode',
            key: 'opcode'
        }
    ];

    const isRowSelected = (row: DisassemblyInfo) => row.addr === props.interpeterDump.registers.pc;

    const formatCell = (row: DisassemblyInfo, col: keyof DisassemblyInfo) => {
        
        const value = row[col];
        if (col === 'addr' || col === 'instr') {
            return row[col].toString(16).padStart(4, '0');
        }

        return value.toString();
    };

    return (
        <Table
            className={props.className} 
            title="disassembly" 
            data={memoryInfo} 
            columns={columns}
            selectedColor="#b477c5"
            isRowSelected={isRowSelected}
            formatCell={formatCell} />
    );
};

export default Disassembly;