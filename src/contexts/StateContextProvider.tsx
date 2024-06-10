import React, {
    createContext,
    useCallback,
    useRef,
    useState,
} from "react";

import {FileSrcType} from "../services/LogFileManager";
import MainWorker from "../services/MainWorker.worker";
import {
    MainWorkerRespMessage,
    WORKER_PROTOCOL_REQ,
    WORKER_PROTOCOL_RESP,
    WorkerRequest,
} from "../typings/worker";


interface StateContextType {
    cursorLineNum: number,
    lines: number[]
    loadFile: (fileSrc: FileSrcType) => void,
    logs: string,
}

/**
 *
 */
const StateDefaultValue = Object.freeze({
    cursorLineNum: 1,
    lines: [],
    loadFile: () => {},
    logs: "",
});

const StateContext = createContext<StateContextType>(StateDefaultValue);

interface StateContextProviderProps {
    children: React.ReactNode
}

/**
 *
 * @param props
 * @param props.children
 */
const StateContextProvider = ({children}: StateContextProviderProps) => {
    const [logs, setLogs] = useState<string>(StateDefaultValue.logs);
    const [cursorLineNum, setCursorLineNum] = useState<number>(StateDefaultValue.cursorLineNum);
    const [lines, setLines] = useState<number[]>(StateDefaultValue.lines);

    const mainWorkerRef = useRef<null|Worker>(null);

    const mainWorkerPostRequest = useCallback(<T extends WORKER_PROTOCOL_REQ>(
        code: T,
        args: WorkerRequest<T>
    ) => {
        mainWorkerRef.current?.postMessage({code, args});
    }, []);

    const handleMainWorkerResponse = useCallback((ev: MessageEvent<MainWorkerRespMessage>) => {
        const {code, args} = ev.data;
        console.log(`[MainWorker -> Render] code=${code}`);
        switch (code) {
            case WORKER_PROTOCOL_RESP.PAGE_DATA:
                // setLogs(args.logs);
                // setLines(args.lines);
                setCursorLineNum(args.cursorLineNum);
                break;
            default:
                console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
                break;
        }
    }, []);

    const loadFile = useCallback((fileSrc: FileSrcType) => {
        if (null !== mainWorkerRef.current) {
            mainWorkerRef.current.terminate();
        }
        mainWorkerRef.current = new MainWorker();
        mainWorkerRef.current.onmessage = handleMainWorkerResponse;
        mainWorkerPostRequest(WORKER_PROTOCOL_REQ.LOAD_FILE, {
            fileSrc: fileSrc,
            cursor: null,
        });
    }, [
        handleMainWorkerResponse,
        mainWorkerPostRequest,
    ]);

    return (
        <StateContext.Provider
            value={{
                cursorLineNum,
                lines,
                loadFile,
                logs,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};


export default StateContextProvider;
export {StateContext};
