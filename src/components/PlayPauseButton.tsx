import { FC } from 'react';
import { ReactComponent as Play } from './play.svg';
import { ReactComponent as Pause }  from './pause.svg';
import { StyleSheet, css } from 'aphrodite/no-important';

export interface PlayPauseButtonProps {
    paused: boolean,
    onClick: () => void,
    size: string,
    margin: string,
}

const PlayPauseButton : FC<PlayPauseButtonProps> = (props) => {

    const styles = StyleSheet.create({
        
        playPause: {
            height: props.size,
            width: props.size,
            margin: props.margin
        },
    });

    return (
        <div className={css(styles.playPause)} onClick={() => props.onClick()}>{props.paused ? <Play /> : <Pause />}</div>
    );
};

export default PlayPauseButton;