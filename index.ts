
type Context = { id: number };
type ContextProvider = {
    get(): Context | null;
    set(ctx: Context): void;
    reset(): void;
}
let ctx: Context|null = null;
const ctxProvider: ContextProvider = {
    get: () => ctx,
    set: (value) => { ctx = value },
    reset: () => ctx = null,
}
type PromiseExecutor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;
function wrapExecutor<T>(ctxProvider: ContextProvider, e: PromiseExecutor<T>): PromiseExecutor<T> {
    return (resolve, reject) => {
        const currentCtx = ctxProvider.get();
        e((value?: T | PromiseLike<T>) => {
            if (currentCtx !== null) {
                ctxProvider.set(currentCtx);
            }
            resolve(value);
        }, (reason?: any) => {
            if (currentCtx !== null) {
                ctxProvider.set(currentCtx);
            }
            reject(reason);
        });
        ctxProvider.reset();
    }
}
global.Promise = class CtxPromise<T> extends Promise<T> {
    constructor(e: PromiseExecutor<T>) {
        super(wrapExecutor(ctxProvider, e));
    }
}
async function wait(t: number) {
    return new Promise((r) => setTimeout(r, t));
}
async function test(ctxProvider: ContextProvider, id: number) {
    ctxProvider.set({ id });
    for (let index = 0; index < 8; index++) {
        let ctx = ctxProvider.get()!;
        if (ctx.id !== id) { throw new Error(`CTX ${id} failed. Actual: ${ctx.id}`); } else { console.log(`CTX ${ctx.id} ok`); }
        await wait(Math.random() * 500 + 500);
        ctx = ctxProvider.get()!;
        if (ctx.id !== id) { throw new Error(`CTX ${id} failed. Actual: ${ctx.id}`); } else { console.log(`CTX ${ctx.id} ok`); }
    }
}
test(ctxProvider, 1);
test(ctxProvider, 2);
test(ctxProvider, 3);