import { FC, useEffect, useState } from 'react';
import { StyleSheet, css, StyleDeclarationValue } from 'aphrodite/no-important';
import { Interpreter } from '../native/pkg';

const keys = [
    ['1', '1', 'Digit1'], 
    ['2', '2', 'Digit2'], 
    ['3', '3', 'Digit3'], 
    ['C', '4', 'Digit4'],
    ['4', 'Q', 'KeyQ'], 
    ['5', 'W', 'KeyW'], 
    ['6', 'E', 'KeyE'], 
    ['D', 'R', 'KeyR'],
    ['7', 'A', 'KeyA'], 
    ['8', 'S', 'KeyS'], 
    ['9', 'D', 'KeyD'], 
    ['E', 'F', 'KeyF'],
    ['A', 'Z', 'KeyZ'], 
    ['0', 'X', 'KeyX'], 
    ['B', 'C', 'KeyC'], 
    ['F', 'V', 'KeyV']
];

const keymap: { [key: string]:  boolean } = {};
keys.forEach(k => keymap[k[2]] = true);

export interface ControlsProps {
    interpreter: Interpreter
}

const Controls: FC<ControlsProps> = (props) => {

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [hoveredKey, setHoveredKey] = useState<string>('');
    const [pressedKey, setPressedKey] = useState<string>('');
    
    useEffect(() => {

        const onKeyDown = (ev: KeyboardEvent) => {
            const key = ev.code;
            if (keymap[key]) {
                setSelectedKeys(prev => [...prev, key]);
            }
        };

        const onKeyUp = (ev: KeyboardEvent) => {
            const key = ev.code;
            if (keymap[key]) {
                setSelectedKeys(prev => prev.filter(k => k !== key));
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    const styles = StyleSheet.create({

        keyContainer: {
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #b477c5',
            padding: '0.3rem',
            userSelect: 'none',
        },

        hovered: {
            backgroundColor: '#2b2b2b',
        },

        selected: {
            borderColor: '#be739a'
        },

        keyboardKey: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            fontWeight: 'bold',
            color: '#a5c7c9',
            fontSize: '0.7rem'
        },

        grid: {
            display: 'grid',
            gridTemplateColumns: 'auto auto auto auto',
            gap: '1rem',
            width: '14rem',
        },

        chip8key: {
            display: 'flex',
            fontSize: '1rem',
        }
    });

    const getkeyContainerStyles = (key: string) => {
        const ret: StyleDeclarationValue[] = [styles.keyContainer];

        if (selectedKeys.includes(key) || pressedKey === key) {
            ret.push(styles.selected);
        }

        if (hoveredKey === key) {
            ret.push(styles.hovered);
        }

        return ret;
    };

    const handleMouseDown = (key: string) => {
        props.interpreter.registerKeyDown(key);
        setPressedKey(key);
    };

    const handleMouseUp = () => {
        props.interpreter.registerKeyUp(pressedKey);
        setPressedKey('');
    };

    const handleMouseLeave = () => {
        if (pressedKey !== '') {
            props.interpreter.registerKeyUp(pressedKey);
            setPressedKey(''); 
        }
        
        setHoveredKey('');
    };

    return(
        <div className={css(styles.grid)}>
            {keys.map((k, idx) => 
                <div className={css(getkeyContainerStyles(k[2]))} 
                    key={idx} 
                    onMouseDown={() => handleMouseDown(k[2])} 
                    onMouseUp={() => handleMouseUp()}
                    onMouseEnter={() => setHoveredKey(k[2])}
                    onMouseLeave={() => handleMouseLeave()}>
                    <div key={`${idx}-1`} className={css(styles.keyboardKey)}>{k[1]}</div>
                    <div key={`${idx}-2`} className={css(styles.chip8key)}>{k[0]}</div>
                </div>)}
        </div>
    );
};

export default Controls;