import { useEffect, useRef, useState } from "react";
import "./App.css";
import numeral from "numeral";
import Modal from "react-modal";

Modal.setAppElement("#root");

function App() {
  const [ticks, setTicks] = useState(0);
  const [startingTicks, setStartingTicks] = useState(0);
  const [scStartingTicks, setSCStartingTicks] = useState(0);
  const [lightGoals, setLightGoals] = useState(0);
  const [darkGoals, setDarkGoals] = useState(0);
  const [quarter, setQuarter] = useState(1);
  const [paused, setPaused] = useState(true);
  const [editing, setEditing] = useState(false);

  const [editMinutes, setEditMinutes] = useState(0);
  const [editSeconds, setEditSeconds] = useState(0);
  const [editSC, setEditSC] = useState(0);
  const [editLightScore, setEditLightScore] = useState(0);
  const [editDarkScore, setEditDarkScore] = useState(0);

  const pausedRef = useRef(paused);
  const ticksRef = useRef(ticks);

  const ticksRemainingQuarter = 7 * 60 * 10 - (ticks - startingTicks);
  const ticksRemainingSC = 30 * 10 - (ticks - scStartingTicks);

  const togglePause = () => {
    console.log("pausing/unpausing");
    setPaused((p) => !p);
  };

  const reset = () => {
    console.log("resetting timer");
    setStartingTicks(ticksRef.current);
    setSCStartingTicks(ticksRef.current);
    setPaused(true);
  };

  const resetShotClock = () => {
    console.log("resetting sc");
    setSCStartingTicks(ticksRef.current);
  };

  const updateTimer = () => setTicks((t) => (pausedRef.current ? t : t + 1));

  const incrementQuarter = () => {
    console.log("updating quarter");
    setQuarter((q) => q + 1);
  };

  const incrementLightGoal = () => {
    console.log("updating light goal");
    setLightGoals((g) => g + 1);
  };

  const incrementDarkGoal = () => {
    console.log("updating dark goal");
    setDarkGoals((g) => g + 1);
  };

  const manuallyEditStart = () => {
    setPaused(true);
    setEditing(true);
    setEditMinutes(Math.floor(ticksRemainingQuarter / 600));
    setEditSeconds(Math.floor((ticksRemainingQuarter % 600) / 10));
    setEditSC(Math.floor(ticksRemainingSC / 10));
    setEditLightScore(lightGoals);
    setEditDarkScore(darkGoals);
  };

  const manuallyEditEnd = () => {
    setEditing(false);
  };

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    ticksRef.current = ticks;

    if (ticks >= scStartingTicks + 300) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaused(true);
      setSCStartingTicks(ticks);
    }
  }, [ticks, scStartingTicks]);

  useEffect(() => {
    const interval = setInterval(updateTimer, 100);

    const handleKey = (e: KeyboardEvent) => {
      console.log(e);
      switch (e.key) {
        case " ":
          togglePause();
          break;
        case "r":
          reset();
          break;
        case "t":
          resetShotClock();
          break;
        case "q":
          incrementQuarter();
          break;
        case "g":
          incrementLightGoal();
          break;
        case "h":
          incrementDarkGoal();
          break;
        case "m":
          manuallyEditStart();
          break;
      }
    };

    document.addEventListener("keypress", handleKey);

    return () => {
      clearInterval(interval);
      document.removeEventListener("keypress", handleKey);
    };
  }, []);

  return (
    <>
      <div className="mainBox">
        <div className="content">
          <h1 className="score">{lightGoals}</h1>
        </div>
        <div className="content">
          <div>
            <h1 className="timer">
              {ticksRemainingQuarter > 600
                ? Math.floor(ticksRemainingQuarter / 600) +
                  ":" +
                  numeral(
                    Math.floor((ticksRemainingQuarter % 600) / 10),
                  ).format("00")
                : numeral(ticksRemainingQuarter / 10).format("0.0")}
            </h1>
            <h2 className="shot-clock">
              {ticksRemainingQuarter > 30
                ? numeral(ticksRemainingSC / 10).format("0.0")
                : ""}
            </h2>

            <h2 className="quarter">{quarter}</h2>
          </div>
        </div>
        <div className="content">
          <h1 className="score dark">{darkGoals}</h1>
        </div>
      </div>
      <Modal
        className="modal"
        isOpen={editing}
        onRequestClose={manuallyEditEnd}
      >
        <h2>Manually change data...</h2>
        <p>Time</p>
        <input type="number" value={editMinutes} /> :{" "}
        <input type="number" value={editSeconds}></input>
        <p>Shot Clock</p>
        <input type="number" value={editSC} />
        <p>Light Team Score</p>
        <input type="number" value={editLightScore} />
        <p>Dark Team Score</p>
        <input type="number" value={editDarkScore} />
      </Modal>
    </>
  );
}

export default App;
