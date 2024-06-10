// noinspection SqlNoDataSourceInspection,SqlResolve

import sqlite3InitModule, {
    BindingSpec,
    Database,
    ExecBaseOptions,
    ExecReturnThisOptions,
    ExecRowModeArrayOptions,
    FlexibleString,
    PreparedStatement,
} from "@sqlite.org/sqlite-wasm";


class LogDbManager {
    #isInited: boolean = false;

    #insertStmt: PreparedStatement | null = null;

    #db: Database | null = null;

    constructor () {

    }

    get isInited () {
        return this.#isInited;
    }

    async init (dbName: string) {
        const sqlite3 = await sqlite3InitModule();
        console.log("Running SQLite3 version", sqlite3.version.libVersion);

        let poolUtil;
        try {
            poolUtil = await sqlite3.installOpfsSAHPoolVfs({clearOnInit: true, name: dbName});
        } catch (e) {
            poolUtil = await sqlite3.installOpfsSAHPoolVfs({
                clearOnInit: true,
                name: `${dbName}-${new Date().valueOf()}`,
            });
        }
        this.#db = new poolUtil.OpfsSAHPoolDb(`/${dbName}`);
        console.log(`OpfsSAH is available, created persisted database at ${this.#db.filename}`);

        this.#db.exec(`CREATE TABLE logs
                       (
                           id        INTEGER PRIMARY KEY,
                           message   TEXT    NOT NULL,
                           timestamp INTEGER NOT NULL,
                           verbosity INTEGER NOT NULL
                       );`);

        this.#insertStmt = this.#db.prepare(`INSERT INTO logs (message, timestamp, verbosity, id)
                                             VALUES (?, ?, ?, ?);`);

        // FIXME
        globalThis.statement = this.#insertStmt;
        this.#isInited = true;
    }

    transaction (wrapped: () => void) {
        if (null === this.#db) {
            throw new Error("init() must be called");
        }

        this.#db.exec("BEGIN TRANSACTION;");
        wrapped();

        // TODO: should probably do only once
        // this.#db.exec(`
        //     CREATE INDEX ts_index ON logs (timestamp);
        //     CREATE INDEX verbosity_index ON logs (verbosity);`);
        this.#db.exec("COMMIT;");
    }

    insert (values: BindingSpec) {
        if (null === this.#insertStmt) {
            throw new Error("init() must be called");
        }

        this.#insertStmt.bind(values);
        this.#insertStmt.step();
        this.#insertStmt.reset();
    }


    // FIXME: should not expose this
    exec (opts: (ExecBaseOptions &
      ExecRowModeArrayOptions &
      ExecReturnThisOptions) & { sql: FlexibleString }) {
        if (null === this.#db) {
            throw new Error("init() must be called");
        }
        this.#db.exec(opts);
    }
}

export default LogDbManager;
