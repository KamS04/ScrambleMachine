export type Row = {
    numBalls: number
}

export const emptyRow: () => Row = () => { return { numBalls: 0 }; }

export enum RV {
    TRUE,
    FALSE,
    NONE
};

export type MachineData = {
    rows: Row[],
    startBalls: number,
    currentRow: number,
    loopSet: boolean,
    loopLoc: number,
    pc: number,
    code: string[],
    shouldHalt: boolean,
    mem: boolean,
    returnValue: RV,
};

export const emptyMachine: () => MachineData = () => {
    return {
        rows: [ emptyRow() ],
        startBalls: 0,
        currentRow: 0,
        loopSet: false,
        loopLoc: -1,
        pc: 0,
        code: [],
        shouldHalt: false,
        mem: false,
        returnValue: RV.NONE,
    };
};

const LOWER_LEVER = "LOWER_LEVER";
const RAISE_LEVER = "RAISE_LEVER";
const CHECK_EMPTY = "CHECK_EMPTY";
const RESET = "RESET";
const SCRAMBLE_DOWN = "SCRAMBLE_DOWN";
const SCRAMBLE_UP = "SCRAMBLE_UP";
const RETURN_FALSE_IF_MEM_FALSE = "RETURN_FALSE_IF_MEM_FALSE";
const RETURN_FALSE_IF_MEM_TRUE = "RETURN_FALSE_IF_MEM_TRUE";
const RETURN_TRUE_IF_MEM_FALSE = "RETURN_TRUE_IF_MEM_FALSE";
const RETURN_TRUE_IF_MEM_TRUE = "RETURN_TRUE_IF_MEM_TRUE";
const LOOP = "LOOP";
const lower = "lower";
const raise = "raise";
const check = "check";
const reset = "reset";
const scr_dwn = "scr_dwn";
const scr_up = "scr_up";
const ret_F_if_F = "ret_F_if_F";
const ret_F_if_T = "ret_F_if_T";
const ret_T_if_F = "ret_T_if_F";
const ret_T_if_T = "ret_T_if_T";
const loop = "loop";


export const instructions = [
    LOWER_LEVER,
    RAISE_LEVER,
    CHECK_EMPTY,
    RESET,
    SCRAMBLE_DOWN,
    SCRAMBLE_UP,
    RETURN_FALSE_IF_MEM_FALSE,
    RETURN_FALSE_IF_MEM_TRUE,
    RETURN_TRUE_IF_MEM_FALSE,
    RETURN_TRUE_IF_MEM_TRUE,
    LOOP,
    lower,
    raise,
    check,
    reset,
    scr_dwn,
    scr_up,
    ret_F_if_F,
    ret_F_if_T,
    ret_T_if_F,
    ret_T_if_T,
    loop,
]

export type McahineUpd  = (md: MachineData) => MachineData;

const nextPC: McahineUpd = (md: MachineData) => {
    let np = md.pc + 1;
    let shouldHalt = false;
    if (np >= md.code.length) {
        if (md.loopSet) {
            np = md.loopLoc >= md.code.length ? -1 : md.loopLoc;
            if (np === -1) {
                shouldHalt = true;
            }
        } else {
            np = -1;
            shouldHalt = true;
        }
    }
    return {
        ...md,
        pc: np,
        shouldHalt,
        returnValue: RV.NONE,
    };
};

const LOWER_LEVER_F = (md: MachineData) => {
    let newRows = md.rows.map( (e) => {return {...e};});
    if (md.currentRow + 1 === md.rows.length) {
        newRows.push(emptyRow());
    }
    return nextPC({
        ...md,
        currentRow: md.currentRow + 1,
        rows: newRows
    });
};

const RAISE_LEVER_F = (md: MachineData) => {
    return nextPC({
        ...md,
        currentRow: (md.currentRow - 1 < 0) ? 0 : md.currentRow - 1
    });
}

const CHECK_EMPTY_F = (md: MachineData) => {
    return nextPC({
        ...md,
        mem: md.rows[md.currentRow].numBalls === 0
    });
};

const RESET_F = (md: MachineData) => {
    return nextPC({
        ...md,
        rows: [
            { ...emptyRow(), numBalls: md.startBalls },
            ...([...Array(md.rows.length-1)].map(emptyRow))
        ]
    })
};

const SCRAMBLE_DOWN_F = (md: MachineData) => {
    let somethingChanged = false;
    let anyChanges = false;
    let newRows = md.rows.map( (e) => {return{...e}} );
    console.log(newRows);

    do {
        anyChanges = false;
        const rowIdx = newRows.findIndex(
            (e,i,a) => i < md.currentRow && e.numBalls > a[i+1].numBalls
        );
        if (rowIdx !== -1) {
            anyChanges = true;
            const fallingBalls = Math.ceil((newRows[rowIdx].numBalls - newRows[rowIdx+1].numBalls) / 2);
            newRows[rowIdx].numBalls -= fallingBalls;
            newRows[rowIdx+1].numBalls += fallingBalls;
            // Update event here
            somethingChanged = true;
        }

    } while (anyChanges);

    return nextPC({
        ...md,
        rows: newRows,
        mem: somethingChanged
    });
};

const SCRAMBLE_UP_F = (md: MachineData) => {
    let somethingChanged = false;
    let anyChanges = false;
    let newRows = md.rows.map( (e) => {return{...e}} );

    do {
        anyChanges = false;
        const rowIdx = newRows.findIndex(
            (e,i,a) => i > 0 && i <= md.currentRow && e.numBalls > a[i-1].numBalls
        );
        if (rowIdx !== -1) {
            anyChanges = true;
            const fallingBalls = newRows[rowIdx].numBalls - newRows[rowIdx-1].numBalls;
            newRows[rowIdx].numBalls -= fallingBalls;
            newRows[rowIdx-1].numBalls += fallingBalls;
            // Update event here
            somethingChanged = true;
        }

    } while (anyChanges);

    return nextPC({
        ...md,
        rows: newRows,
        mem: somethingChanged
    });
};

const RETURN_FALSE_IF_MEM_FALSE_F = (md: MachineData) => {
    if (md.mem) {
        return nextPC(md);
    }

    console.log("Ending it with false");
    return ({
        ...md,
        shouldHalt: true,
        returnValue: RV.FALSE
    });
};

const RETURN_FALSE_IF_MEM_TRUE_F = (md: MachineData) => {
    if (md.mem) {
        return {
            ...md,
            shouldHalt: true,
            returnValue: RV.FALSE
        };
    }
    return nextPC(md);
};

const RETURN_TRUE_IF_MEM_FALSE_F = (md: MachineData) => {
    if (md.mem) {
        return nextPC(md);
    }

    return {
        ...md,
        shouldHalt: true,
        returnValue: RV.TRUE
    };
};

const RETURN_TRUE_IF_MEM_TRUE_F = (md: MachineData) => {
    if (md.mem) {
        return {
            ...md,
            shouldHalt: true,
            returnValue: RV.TRUE
        };
    }

    return nextPC(md);
}

const LOOP_F = (md: MachineData) => {
    return nextPC({
        ...md,
        loopSet: true,
        loopLoc: md.pc + 1,
    });
}

export const instrs: Map<string, McahineUpd> = new Map([
    [ LOWER_LEVER, LOWER_LEVER_F ],
    [ RAISE_LEVER, RAISE_LEVER_F ],
    [ CHECK_EMPTY, CHECK_EMPTY_F ],
    [ RESET, RESET_F ],
    [ SCRAMBLE_DOWN, SCRAMBLE_DOWN_F ],
    [ SCRAMBLE_UP, SCRAMBLE_UP_F ],
    [ RETURN_FALSE_IF_MEM_FALSE, RETURN_FALSE_IF_MEM_FALSE_F ],
    [ RETURN_FALSE_IF_MEM_TRUE, RETURN_FALSE_IF_MEM_TRUE_F ],
    [ RETURN_TRUE_IF_MEM_FALSE, RETURN_TRUE_IF_MEM_FALSE_F ],
    [ RETURN_TRUE_IF_MEM_TRUE, RETURN_TRUE_IF_MEM_TRUE_F ],
    [ LOOP, LOOP_F ],

    [ lower, LOWER_LEVER_F ],
    [ raise, RAISE_LEVER_F ],
    [ check, CHECK_EMPTY_F ],
    [ reset, RESET_F ],
    [ scr_dwn, SCRAMBLE_DOWN_F ],
    [ scr_up, SCRAMBLE_UP_F ],
    [ ret_F_if_F, RETURN_FALSE_IF_MEM_FALSE_F ],
    [ ret_F_if_T, RETURN_FALSE_IF_MEM_TRUE_F ],
    [ ret_T_if_F, RETURN_TRUE_IF_MEM_FALSE_F ],
    [ ret_T_if_T, RETURN_TRUE_IF_MEM_TRUE_F ],
    [ loop, LOOP_F ],
]);

