import {
    MainWorkerReqMessage,
    WORKER_PROTOCOL_REQ,
    WORKER_PROTOCOL_RESP,
} from "../typings/worker";
import LogFileManager from "./LogFileManager";


let LOG_FILE_MANAGER : null | LogFileManager = null;
onmessage = async (ev: MessageEvent<MainWorkerReqMessage>) => {
    const {code, args} = ev.data;
    console.log(`[Render -> MainWorker] code=${code}: args=${JSON.stringify(args)}`);
    switch (code) {
        case WORKER_PROTOCOL_REQ.LOAD_FILE:
            const start = new Date();
            LOG_FILE_MANAGER = new LogFileManager();
            await LOG_FILE_MANAGER.loadFile(args.fileSrc);
            postMessage({
                code: WORKER_PROTOCOL_RESP.PAGE_DATA,
                args: LOG_FILE_MANAGER.loadPage(args.cursor),
            });
            console.log(new Date() - start);
            break;
        default:
            console.error(`Unexpected ev.data: ${JSON.stringify(ev.data)}`);
            break;
    }
};

// This `new` (constructor definition) is needed to get worker-loader + TypeScript work
declare const self: ServiceWorkerGlobalScope;
const ctx: Worker & { new (): Worker} = self as never;
export default ctx;
