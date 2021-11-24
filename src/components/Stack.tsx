import { FC } from 'react';
import Table, { Column } from './Table';

export interface StackProps {
    className?: string,
    stack: number[]
}

interface StackInfo {
    value: number
}

const Stack: FC<StackProps> = (props) => {

    const columns: Column<StackInfo, keyof StackInfo>[] = [
        {
            header: 'value',
            key: 'value'
        },
    ];

    const data: StackInfo[] = props.stack.map(v => { return {value: v};}).reverse();

    const formatCell = (row: StackInfo, col: keyof StackInfo) => row[col].toString(16).padStart(4, '0');

    return (
        <Table
            className={props.className} 
            title="stack" 
            data={data} 
            columns={columns}
            formatCell={formatCell} />
    );
};

export default Stack;