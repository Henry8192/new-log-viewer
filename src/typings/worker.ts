import {
    CursorType,
    FileSrcType,
} from "../services/LogFileManager";


/**
 * Enum of the protocol code for communications between the client and CLP worker.
 */
enum WORKER_PROTOCOL_REQ {
    LOAD_FILE = "loadFile",
}

enum WORKER_PROTOCOL_RESP {
    PAGE_DATA = "pageData"
}

type WorkerRequestMap = {
  [WORKER_PROTOCOL_REQ.LOAD_FILE]: {
      fileSrc: FileSrcType,
      cursor: CursorType,
  };
};

type WorkerRespMap = {
  [WORKER_PROTOCOL_RESP.PAGE_DATA]: {
    logs: string,
      lines: number[],
      cursorLineNum: number
  };
};

type WorkerRequest<T extends WORKER_PROTOCOL_REQ> = T extends keyof WorkerRequestMap ?
    WorkerRequestMap[T] :
    never;

type WorkerResponse<T extends WORKER_PROTOCOL_RESP> = T extends keyof WorkerRespMap ?
    WorkerRespMap[T] :
    never;

type MainWorkerReqMessage = {
  [T in keyof WorkerRequestMap]: { code: T, args: WorkerRequestMap[T]};
}[keyof WorkerRequestMap];

type MainWorkerRespMessage = {
  [T in keyof WorkerRespMap]: { code: T, args: WorkerRespMap[T]};
}[keyof WorkerRespMap];


export {
    WORKER_PROTOCOL_REQ,
    WORKER_PROTOCOL_RESP,
};
export type {
    MainWorkerReqMessage,
    MainWorkerRespMessage,
    WorkerRequest,
    WorkerResponse,
};
