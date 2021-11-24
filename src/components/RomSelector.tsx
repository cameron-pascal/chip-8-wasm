import { useState } from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';

interface RomInfo {
    romType: RomType,
    displayName: string,
    url: string,
}

enum RomType {
    Blinky,
    Blitz,
    Brix,
    Connect4,
    Guess,
    Hidden,
    Ibm,
    Invaders,
    Kaleid,
    Maze,
    Merlin,
    Missile,
    Pong,
    Pong2,
    Puzzle,
    Puzzle15,
    Syzygy,
    Tank,
    Tetris,
    Tictac,
    Ufo,
    Vbrix,
    Vers,
    Wipeoff,
}

const availableRoms = new Map<RomType, RomInfo>();
availableRoms.set(RomType.Blinky, { romType: RomType.Blinky, displayName: 'BLINKY', url: 'roms/blinky'});
availableRoms.set(RomType.Blitz, { romType: RomType.Blitz, displayName: 'BLITZ', url: 'roms/blitz'});
availableRoms.set(RomType.Brix, { romType: RomType.Brix, displayName: 'BRIX', url: 'roms/brix'});
availableRoms.set(RomType.Connect4, { romType: RomType.Connect4, displayName: 'CONNECT4', url: 'roms/connect4'});
availableRoms.set(RomType.Guess, { romType: RomType.Guess, displayName: 'GUESS', url: 'roms/guess'});
availableRoms.set(RomType.Hidden, { romType: RomType.Hidden, displayName: 'HIDDEN', url: 'roms/hidden'});
availableRoms.set(RomType.Ibm, { romType: RomType.Ibm, displayName: 'IBM', url: 'roms/ibm'});
availableRoms.set(RomType.Invaders, { romType: RomType.Invaders, displayName: 'INVADERS', url: 'roms/invaders'});
availableRoms.set(RomType.Kaleid, { romType: RomType.Kaleid, displayName: 'KALEID', url: 'roms/kaleid'});
availableRoms.set(RomType.Maze, { romType: RomType.Maze, displayName: 'MAZE', url: 'roms/maze'});
availableRoms.set(RomType.Merlin, { romType: RomType.Merlin, displayName: 'MERLIN', url: 'roms/merlin'});
availableRoms.set(RomType.Missile, { romType: RomType.Missile, displayName: 'MISSILE', url: 'roms/missile'});
availableRoms.set(RomType.Pong, { romType: RomType.Pong, displayName: 'PONG', url: 'roms/pong'});
availableRoms.set(RomType.Pong2, { romType: RomType.Pong2, displayName: 'PONG2', url: 'roms/pong2'});
availableRoms.set(RomType.Puzzle, { romType: RomType.Puzzle, displayName: 'PUZZLE', url: 'roms/puzzle'});
availableRoms.set(RomType.Puzzle15, { romType: RomType.Puzzle15, displayName: 'PUZZLE15', url: 'roms/puzzle15'});
availableRoms.set(RomType.Syzygy, { romType: RomType.Syzygy, displayName: 'SYZYGY', url: 'roms/syzygy'});
availableRoms.set(RomType.Tank, { romType: RomType.Tank, displayName: 'TANK', url: 'roms/tank'});
availableRoms.set(RomType.Tetris, { romType: RomType.Tetris, displayName: 'TETRIS', url: 'roms/tetris'});
availableRoms.set(RomType.Tictac, { romType: RomType.Tictac, displayName: 'TICTAC', url: 'roms/tictac'});
availableRoms.set(RomType.Ufo, { romType: RomType.Ufo, displayName: 'UFO', url: 'roms/ufo'});
availableRoms.set(RomType.Vbrix, { romType: RomType.Vbrix, displayName: 'VBRIX', url: 'roms/vbrix'});
availableRoms.set(RomType.Vers, { romType: RomType.Vers, displayName: 'VERS', url: 'roms/vers'});
availableRoms.set(RomType.Wipeoff, { romType: RomType.Wipeoff, displayName: 'WIPEOFF', url: 'roms/wipeoff'});

export interface RomSelectorProps {
    onRomDataChanged(romData: ArrayBuffer): void
}

const RomSelector : React.FC<RomSelectorProps> = (props) => {

    const fetchRomData = async (romInfo: RomInfo) => {
        const response = await fetch(romInfo?.url);
        const data = await (await response.blob()).arrayBuffer();
        props.onRomDataChanged(data);
    };

    const [selectedRom, setSelectedRom] = useState(() => {
        const romInfo = availableRoms.get(RomType.Invaders)!;

        (async () => {
            await fetchRomData(romInfo);
        })();

        return romInfo;
    });

    const onRomChange = (romType: RomType) => {
        if (selectedRom.romType !== romType) {
            const romInfo = availableRoms.get(romType)!;
            setSelectedRom(romInfo);

            (async () => {
                await fetchRomData(romInfo);
            })();
        }  
    };

    // TODO: add loading indicator
    // TODO: allow rom uploads.
    // TODO: error handling

    return (
        <>
            <select value={selectedRom?.romType} onChange={(ev) => onRomChange(Number(ev.target.value) as RomType)}>
                {Array.from(availableRoms.values()).map(rom => (
                    <option key={rom.romType} value={rom.romType}>{rom.displayName}</option>
                ))}
            </select>
        </>
    );
};

export default RomSelector;