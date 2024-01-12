import React from 'react';
import { Row } from '../data/Machine';

interface RVProps {
    row: Row,
    last: Boolean,
}

const RowView: React.FC<RVProps> = ({ row, last }) => {
    return (
        <div className={"flex-grow border-red-400 " + (last ? "" : "border-b-2")}>
            <div className="flex flex-row flex-wrap">
                {
                    row.numBalls > 0 ?
                        [...Array(row.numBalls)].map( (_,i) => (
                            <div key={i} className="m-2">
                                <div
                                    className="w-full h-full rounded-full bg-blue-200"
                                    style={{ width: "50px", height: "50px" }}
                                />
                            </div>
                        ))
                    : (
                        <div className="m-2">
                            <div
                                className="w-full h-full rounded-full"
                                style={{ width: "50px", height: "50px" }}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    )
};

export default RowView;