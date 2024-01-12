import React from 'react';
import { MachineData } from '../data/Machine';
import RowView from './RowView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface MVProps {
    onRowsChange? : (ev: React.ChangeEvent<HTMLInputElement>) => void,
    onStartingBallsChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void,
    rowsMin?: number,
    ballsMin?: number,
    machineData: MachineData,
    playing: boolean,
};

const MachineView: React.FC<MVProps> = ({ onRowsChange, onStartingBallsChange, machineData, rowsMin, ballsMin, playing }) => {
    return (
        <div>
            {/* Controls */}
            <div className="border-2 border-red-400 w-full p-8">

                <div>
                    <div className="flex justify-between">
                        <div className="rounded-lg p-4 mr-4 bg-blue-400">
                            <span>Memory: </span>
                            <span className="bg-slate-50 rounded-lg p-2 ml-2">
                                { machineData.mem ? "True" : "False" }
                            </span>
                        </div>


                        <div
                            className="flex justify-end row-gap"
                            style={
                                { color: playing ? "grey" : "black" }
                            }
                            >
                            <div className={"rounded-lg p-4 mr-4 " + (playing ? "bg-gray-400" : "bg-red-400")}>
                                <span className="mr-4">Starting Rows</span>
                                <input
                                    type="number"
                                    size={6}
                                    value={machineData.rows.length}
                                    min={rowsMin}
                                    onChange={onRowsChange}
                                    disabled={playing}
                                    className="text-center"
                                    />
                            </div>

                            <div className={"rounded-lg p-4 " + (playing ? "bg-gray-400" : "bg-red-400")}>
                                <span className="mr-4">Starting Balls</span>
                                <input
                                    type="number"
                                    size={6}
                                    value={machineData.startBalls}
                                    min={ballsMin}
                                    onChange={onStartingBallsChange}
                                    disabled={playing}
                                    className="text-center"
                                    />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-2 border-red-400 flex flex-col">
                    {
                        machineData.rows.map( (el,i) => (
                                <div key={i} className="flex flex-row">
                                    <div className="m-4 mt-auto mb-auto">
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            style={machineData.currentRow === i ? {} : { color: "white"}} />
                                    </div>
                                    <RowView row={el} last={i + 1 === machineData.rows.length} />
                                </div>
                            )
                        )
                    }
                </div>

            </div>
        </div>
    )
}

export default MachineView;