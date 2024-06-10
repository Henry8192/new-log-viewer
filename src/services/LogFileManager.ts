// @ts-expect-error
import xxhash from "xxhash-wasm";

import {RADIX} from "../typings/js";
import {getUint8ArrayFrom} from "../utils/http";
import Decoder from "./decoders/Decoder";
import JsonlDecoder from "./decoders/JsonlDecoder";
import DecoderModule from "./decoders/zstd-js";
import LogDbManager from "./LogDbManager";


type FileSrcType = string | File;
type CursorType = null | {pageNum: number} | {timestamp: number} | {logEventIdx: number};

class LogFileManager {
    #fileData: Uint8Array | null = null;

    #logDbManager: LogDbManager;

    #decoder: Decoder | null;

    constructor () {
        this.#logDbManager = new LogDbManager();
    }

    async loadFile (fileSrc: FileSrcType) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const {h64Raw} = await xxhash();

        if ("string" === typeof fileSrc) {
            this.#fileData = await getUint8ArrayFrom(fileSrc, () => null);

            const fileHash = h64Raw(this.#fileData).toString(RADIX.HEX);
            await this.#logDbManager.init(fileHash);
        } else {
            // FIXME
            console.error("Read from File not yet supported");
        }
        const module = await DecoderModule();
        const dataPtr = module._malloc(this.#fileData?.length);
        module.HEAPU8.set(this.#fileData, dataPtr);
        this.#decoder = new module.ClpIrV1Decoder(dataPtr, this.#fileData?.length);
        const count = this.#decoder?.buildIdx();
        console.log("count", count);

        globalThis.results = [];

        // this.#decoder?.decode(370000, count);
        this.#decoder?.decode(0, count);


        // const fileHash = h64Raw(this.#fileData).toString(RADIX.HEX)
    }

    loadPage (cursor: CursorType): {
        logs: string,
        lines: number[],
        cursorLineNum: number
    } {
        console.debug(`loadPage: cursor=${JSON.stringify(cursor)}`);

        // FIXME
        // this.#logDbManager.transaction(() => {
        //     for (let i = 0; 100 > i; i++) {
        //         this.#logDbManager.insert([
        //             "hi\n",
        //             (new Date()).valueOf(),
        //             0,
        //         ]);
        //     }
        // });

        const messages: string[] = [];
        const lines: number[] = [];
        let currentLine = 1;

        // this.#logDbManager.exec({sql: "SELECT message FROM logs;",
        //     rowMode: "array",
        //     callback: (r) => {
        //         const [m] = r as [string];
        //         messages.push(m);
        //         lines.push(currentLine);
        //         currentLine += m.split("\n").length - 1;
        //     }});

        globalThis.results.forEach((r) => {
            const [m] = r as [string];
            messages.push(m);
            lines.push(currentLine);
            currentLine += m.split("\n").length - 1;
        });
        setTimeout(() => {
            this.#logDbManager.transaction(() => {
                globalThis.results.forEach((r) => {
                    globalThis.statement.bind(r);
                    globalThis.statement.step(r);
                    globalThis.statement.reset(r);
                });
            });
        }, 0);


        return {
            logs: messages.join(),
            lines: lines,
            cursorLineNum: 1,
        };
    }
}

export default LogFileManager;
export type {
    CursorType,
    FileSrcType,
};
