import {
    useContext,
    useEffect,
} from "react";

import {StateContext} from "../contexts/StateContextProvider";


/**
 *
 */
const Viewer = () => {
    const {
        cursorLineNum,
        lines,
        loadFile,
        logs,
    } = useContext(StateContext);

    useEffect(() => {
        loadFile("http://localhost:3010/test/example.clp.zst");

        // loadFile("https://yscope.s3.us-east-2.amazonaws.com/sample-logs/yarn-ubuntu-resourcemanager-ip-172-31-17-135.log.1.clp.zst");
    }, [loadFile]);

    return (
        <>
            <div>
                <h4>cursorLineNum</h4>
                <p>
                    {cursorLineNum}
                </p>
            </div>
            <div>
                <h4>lines</h4>
                <p>
                    {lines}
                </p>
            </div>
            <div>
                <h4>logs</h4>
                <p>
                    {logs}
                </p>
            </div>
        </>
    );
};

export default Viewer;
