import React, { useEffect, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForwardStep, faPause, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import CodeView, { validateCode } from "./components/CodeView";
import MachineView from "./components/MachineView";
import { MachineData, McahineUpd, emptyRow, emptyMachine, instrs, RV } from "./data/Machine";

function App() {
    const h = "45px";

    const [ playing, setPlaying ] = useState(false);
    const [ machine, setMachine ] = useState<MachineData>(emptyMachine());
    const [ stepTime, setStepTime ] = useState(1);
    const [ high, setHigh ] = useState(-1);
    const [ haltFlag, setHaltFlag ] = useState(false);

    const calculateMachine: (md: MachineData) => MachineData = (md: MachineData) => {
        return (instrs.get( md.code[md.pc] ) as McahineUpd)(md);
    };

    // const haltMachine = (md: MachineData, ty: any) => () => {
    //     stopMachine(ty);
    // };

    const showResult = (rv: RV) => () => {
        if (rv === RV.NONE) {
            console.log(`Machine errored with ${rv}`);
            alert("Machine Error");
        } else if (rv === RV.TRUE) {
            console.log(`Machine true with ${rv}`);
            alert("Machine True");
        } else {
            console.log(`Machine false with ${rv}`);
            alert("Machine False");
        }
    };

    // useEffect( () => {
    //     console.log(machine.rows);
    // }, [machine]);

    const startMachine = (stTime: number, cmd: MachineData) => (ev: React.MouseEvent<HTMLButtonElement>) => {
        console.log('Starting');
        const codeValid = validateCode();
        cmd = {
            ...cmd,
            rows: cmd.rows.map( (_,i) => i === 0 ? { ...emptyRow(), numBalls: cmd.startBalls } : emptyRow() )
        };
        setMachine(cmd);
        if (codeValid) {
            setHigh(0);

            const step = (md: MachineData) => () => {
                if ((window as any).haltFlag) {
                    // Halt
                    setPlaying(false);
                    setMachine({
                        ...md,
                        currentRow: 0,
                        pc: 0
                    });
                    setHaltFlag(false);
                } else {
                    const newMach = calculateMachine(md);
                    console.log(`Step: ${md.code[md.pc]}`);
                    setMachine(newMach)
                    setHigh(md.pc);
    
                    setTimeout( () => {
                        if (newMach.shouldHalt) {
                            console.log(newMach);
                            setTimeout( () => setPlaying(false), 0);
                            setTimeout( showResult(newMach.returnValue), 0);
                            setTimeout( () => {
                                setMachine({
                                    ...newMach,
                                    currentRow: 0,
                                    pc: 0,
                                })
                            })
                        } else {
                            setTimeout( step(newMach), stTime * 1000);
                        }
                    }, 0);
                }
            }

            setTimeout( step(cmd), stTime * 1000 );
            console.log(stTime * 1000);
            setPlaying(true);
        }
    };

    useEffect( () => {
        (window as any).haltFlag = haltFlag;
        console.log("Halt Raised");
    }, [haltFlag])

    return (
        <div className="App">
            <div>
                <div className="m-4 flex justify-start flex-row">
                    <div className="p-3 flex rounded-lg bg-red-400">
                        <span className="mr-4">Step Time</span>
                        <input
                            type="number"
                            size={6}
                            min={0}
                            value={stepTime}
                            onChange={ (ev) => {
                                ev.preventDefault();
                                let nv = ev.target.value;
                                if (nv === "") {
                                    nv = "0";
                                } else if (parseFloat(nv) < 0) {
                                    nv = "0";
                                }
                                setStepTime(parseFloat(nv));
                            }}
                            className="text-center"
                            />
                        <span className="ml-2">s</span>
                    </div>
                </div>

                <div className="flex justify-center text-center flex-row m-4">
                    <div className="p-4 flex rounded-lg">
                        <button
                            className="p-2 rounded-lg hover:border-blue-600 hover:border-2: bg-blue-400 hover:scale-150 aspect-square"
                            style={{minHeight: h}}
                            onClick={(ev) => {
                                if (playing) {
                                    setHaltFlag(true);
                                } else {
                                    startMachine(stepTime, machine)(ev);
                                }
                            }}>
                            <FontAwesomeIcon icon={playing ? faPause : faPlay} />
                        </button>
                    </div>
                </div>
                {/* <div className="flex justify-center flex-row m-4">
                    <div className="p-4 flex rounded-lg">
                        <button
                        className="p-2 rounded-l-lg hover:rounded-lg hover:border-blue-600 hover:border-2 bg-blue-400 hover:scale-150 aspect-square"
                        style={{ minHeight: h }}
                        onClick={() => {
                            if (playing) {
                                setHaltFlag(true);
                            }
                        }}
                        >
                            <FontAwesomeIcon icon={faStop} />
                        </button>
                        <button
                            className="p-2 bg-blue-400 hover:scale-150 hover:rounded-lg hover:border-blue-600 hover:border-2 aspect-square"
                            style={{ minHeight: h }}
                            onClick={(ev) => {
                                console.log('clicked');
                                console.log(playing);
                                if (!playing) {
                                    console.log('Not playing');
                                    startMachine(stepTime, machine)(ev);
                                }
                            }}
                            >
                            <FontAwesomeIcon icon={playing ? faPause : faPlay} />
                        </button>
                        <button
                            className="p-2 rounded-r-lg hover:rounded-lg hover:border-blue-600 hover:border-2 bg-blue-400 hover:scale-150 aspect-square"
                            style={{ minHeight: h }}
                            >
                            <FontAwesomeIcon icon={faForwardStep} />
                        </button>
                    </div>
                </div> */}
            </div>

            <div className="flex flex-col lg:flex-row justify-start md:justify-between">
                <div className="w-full lg:w-1/4">
                    <CodeView
                        highlightedLine={ playing ? high : -1 }
                        updateValue={(v) => {
                            setMachine({
                                ...machine,
                                code: v.split('\n')
                            })
                        }}
                    />
                </div>

                <div className="mt-4 lg:ml-4 lg:mt-none"></div>

                <div className="w-full lg:w-3/4">
                    <MachineView
                        playing={playing}
                        rowsMin={1}
                        ballsMin={0}
                        onRowsChange={(ev) => {
                            ev.preventDefault();
                            let nv = ev.target.value;
                            if (nv === "") {
                                nv = "1";
                            } else if (parseInt(nv) < 1) {
                                nv = "1";
                            }
                            const newLength = parseInt(nv);
                            const newRows =
                                newLength < machine.rows.length ?
                                    machine.rows.slice(0, newLength)
                                :
                                    [
                                        ...machine.rows,
                                        ...([...Array(newLength - machine.rows.length)].map( i => emptyRow() ))
                                    ];
                            
                            setMachine({
                                ...machine,
                                rows: newRows
                            });
                        }} 
                        onStartingBallsChange={(ev) => {
                            ev.preventDefault();
                            let nv = ev.target.value;
                            if (nv === "") {
                                nv = "1";
                            } else if (parseInt(ev.target.value) < 0) {
                                nv = "1";
                            }

                            const newRows = machine.rows.map( (e,i) => { return { ...e, numBalls: i === 0 ? parseInt(nv) : 0 };  } );

                            setMachine({
                                ...machine,
                                rows: newRows,
                                startBalls: parseInt(nv)
                            });
                        }}
                        machineData={machine}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
