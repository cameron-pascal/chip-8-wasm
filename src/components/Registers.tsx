import { FC } from 'react';
import { RegisterDump } from './Runner';
import Table, { Column } from './Table';

export interface RegistersDumpProps {
    registerDump: RegisterDump
    className?: string
}

interface RegisterData {
    name: string,
    value: string
}

const Registers: FC<RegistersDumpProps> = (props) => {

    const columns: Column<RegisterData, keyof RegisterData>[] = [
        {
            header: 'register',
            key: 'name'
        },
        {
            header: 'value',
            key: 'value'
        },
    ];

    const registerData: RegisterData[] = [];
    registerData.push({name: 'PC', value: props.registerDump.pc.toString(16).padStart(4, '0')});
    registerData.push({name: 'I', value: props.registerDump.i.toString(16).padStart(4, '0')});
    registerData.push({name: 'DT', value: props.registerDump.dt.toString(16).padStart(2, '0')});
    registerData.push({name: 'ST', value: props.registerDump.st.toString(16).padStart(2, '0')});
    
    props.registerDump.v.forEach((value, index) => {
        registerData.push({name: `V${index.toString(16).toUpperCase()}`, value: value.toString(16).padStart(2, '0')});
    });

    return <Table className={props.className} title='registers' columns={columns} data={registerData} />;
};

export default Registers;