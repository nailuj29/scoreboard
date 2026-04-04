import { useEffect, useRef, useState } from "react";
import "./App.css";
import numeral from "numeral";
import Modal from "react-modal";
import Horn from "./assets/Air Horn.mp3";
import Buzzer from "./assets/Buzzer.mp3";

Modal.setAppElement("#root");

function App() {
  const [ticks, setTicks] = useState(0);
  const [startingTicks, setStartingTicks] = useState(0);
  const [scStartingTicks, setSCStartingTicks] = useState(0);
  const [lightGoals, setLightGoals] = useState(0);
  const [darkGoals, setDarkGoals] = useState(0);
  const [quarter, setQuarter] = useState(1);
  const [paused, setPaused] = useState(true);

  const [lightName, setLightName] = useState("light");
  const [darkName, setDarkName] = useState("dark");

  const [editing, setEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editSeconds, setEditSeconds] = useState(0);
  const [editSC, setEditSC] = useState(0);
  const [editLightScore, setEditLightScore] = useState(0);
  const [editDarkScore, setEditDarkScore] = useState(0);
  const [editQuarter, setEditQuarter] = useState(1);
  const [editLightName, setEditLightName] = useState("");
  const [editDarkName, setEditDarkName] = useState("");

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
    console.log("starting manual editing");
    setPaused(true);
    setEditing(true);
  };

  const manuallyEditEnd = () => {
    setEditing(false);
    setLightGoals(editLightScore);
    setDarkGoals(editDarkScore);
    setStartingTicks(0);
    const ticksRemainingQuarterNew = (editMinutes * 60 + editSeconds) * 10;
    const ticksElapsed = 7 * 60 * 10 - ticksRemainingQuarterNew;
    const ticksRemainingSCNew = editSC * 10;
    const ticksElapsedSC = 30 * 10 - ticksRemainingSCNew;
    setTicks(ticksElapsed);
    setSCStartingTicks(ticksElapsed - ticksElapsedSC);

    setQuarter(editQuarter);

    setLightName(editLightName);
    setDarkName(editDarkName);
  };

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditMinutes(Math.floor(ticksRemainingQuarter / 600));
    setEditSeconds(Math.floor((ticksRemainingQuarter % 600) / 10));
    setEditSC(Math.floor(ticksRemainingSC / 10));
    setEditLightScore(lightGoals);
    setEditDarkScore(darkGoals);
    setEditQuarter(quarter);
    setEditLightName(lightName);
    setEditDarkName(darkName);
  }, [
    ticksRemainingQuarter,
    ticksRemainingSC,
    lightGoals,
    darkGoals,
    quarter,
    lightName,
    darkName,
  ]);

  useEffect(() => {
    ticksRef.current = ticks;

    if (ticks >= scStartingTicks + 300) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaused(true);
      setSCStartingTicks(ticks);
      new Audio(Horn).play();
    }

    if (ticksRemainingQuarter <= 0) {
      reset();
      incrementQuarter();
      new Audio(Buzzer).play();
    }
  }, [ticks, scStartingTicks, ticksRemainingQuarter]);

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
        case "s":
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
          <div>
            <h1 className="score">{lightGoals}</h1>
            <p className="name">{lightName}</p>
          </div>
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
            <h2 className={`shot-clock ${ticksRemainingSC > 50 ? "" : "red"}`}>
              {ticksRemainingQuarter > 300
                ? numeral(ticksRemainingSC / 10).format("0.0")
                : ""}
            </h2>

            <h2 className="quarter">{quarter}</h2>
          </div>
        </div>
        <div className="content">
          <div>
            <h1 className="score dark">{darkGoals}</h1>
            <p className="name dark">{darkName}</p>
          </div>
        </div>
      </div>
      <Modal
        className="modal"
        isOpen={editing}
        onRequestClose={manuallyEditEnd}
      >
        <h2>Manually change data...</h2>
        <h3>
          WARNING: As of right now, this does NOT take into account the previous
          data.
        </h3>
        <p>Time</p>
        <input
          type="number"
          value={editMinutes}
          onChange={(e) => setEditMinutes(parseInt(e.target.value))}
        />{" "}
        :{" "}
        <input
          type="number"
          value={editSeconds}
          onChange={(e) => setEditSeconds(parseInt(e.target.value))}
        ></input>
        <p>Shot Clock</p>
        <input
          type="number"
          value={editSC}
          onChange={(e) => setEditSC(parseInt(e.target.value))}
        />
        <p>{lightName} Team Score</p>
        <input
          type="number"
          value={editLightScore}
          onChange={(e) => setEditLightScore(parseInt(e.target.value))}
        />
        <p>{lightName} Name</p>
        <input
          type="text"
          value={editLightName}
          onChange={(e) => setEditLightName(e.target.value)}
        />
        <p>{darkName} Team Score</p>
        <input
          type="number"
          value={editDarkScore}
          onChange={(e) => setEditDarkScore(parseInt(e.target.value))}
        />
        <p>{darkName} Name</p>
        <input
          type="text"
          value={editDarkName}
          onChange={(e) => setEditDarkName(e.target.value)}
        />
        <p>Quarter</p>
        <input
          type="number"
          value={editQuarter}
          onChange={(e) => setEditQuarter(parseInt(e.target.value))}
        />
        <br />
        <button onClick={manuallyEditEnd}>Save Changes</button>
      </Modal>
    </>
  );
}

export default App;
