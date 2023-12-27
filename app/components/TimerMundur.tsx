import Countdown from 'react-countdown';

export default function TimerMundur(props) {
    const Completionist = () => <span>Waktu habis!</span>;
    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return <Completionist />;
        } else {
            return <span>{minutes}:{seconds}</span>;
        }
    };
    const waktu = props.detik * 1000 || 60
    return (
        <Countdown
            date={Date.now() + waktu}
            renderer={renderer}
        />
    )
}
