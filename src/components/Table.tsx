import { StyleSheet, css } from 'aphrodite/no-important';

// Props to Miina Lervik for coming up with this simple way to do a table in react and typescript.
// https://react.christmas/2020/22

export type Column<T, K extends keyof T> = {
    key: K,
    header: string
}

export type TableProps<T, K extends keyof T> = {
    title: string,
    data: T[],
    columns: Column<T, K>[],
    className?: string,
    isRowSelected?: (row: T) => boolean,
    selectedColor?: string,
    formatCell?: (row: T, columnId: K) => string,
}

const Table = <T, K extends keyof T>(props: TableProps<T, K>): JSX.Element => {

    const gridTemplate = props.columns.map(() => 'auto').join(' ');

    const styles = StyleSheet.create({
        table: {
            display: 'grid',
            columnGap: '1rem',
            gridTemplateColumns: gridTemplate
        },

        header: {
            fontWeight: 'bold',
            fontSize: '0.9rem',
            textDecoration: 'underline',
            margin: '0.1rem 0 0.1rem 0',
        },

        title: {
            marginBottom: '0.1rem',
            fontSize: '1rem',
            color: '#b477c5'
        },

        selectedCell: {
            color: props.selectedColor,
            fontWeight: 'bold'
        }
    });

    const cells = props.columns.map((col, idx) => <div className={css(styles.header)} key={idx}>{col.header}</div>);

    props.data.forEach((row, rowIdx) => {

        const cellClass = props.isRowSelected && props.isRowSelected(row) ? css(styles.selectedCell) : undefined;
        

        props.columns.forEach((col, colIdx) => {
            const cellValue = props.formatCell ? props.formatCell(row, col.key) : row[col.key];;
            cells.push(<div className={cellClass} key={`${rowIdx}${colIdx}`}>{cellValue}</div>);
        });
    });

    return (
        <div className={props.className}>
            <div className={css(styles.title)}>{props.title.toUpperCase()}</div>
            <div className={css(styles.table)}>
                {cells}
            </div>
        </div>
    );
};

export default Table;