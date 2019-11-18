"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let ctx = null;
const ctxProvider = {
    get: () => ctx,
    set: (value) => { ctx = value; },
    reset: () => ctx = null,
};
function wrapExecutor(ctxProvider, e) {
    return (resolve, reject) => {
        const currentCtx = ctxProvider.get();
        e((value) => {
            if (currentCtx !== null) {
                ctxProvider.set(currentCtx);
            }
            resolve(value);
        }, (reason) => {
            if (currentCtx !== null) {
                ctxProvider.set(currentCtx);
            }
            reject(reason);
        });
        ctxProvider.reset();
    };
}
global.Promise = class CtxPromise extends Promise {
    constructor(e) {
        super(wrapExecutor(ctxProvider, e));
    }
};
function wait(t) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((r) => setTimeout(r, t));
    });
}
function test(ctxProvider, id) {
    return __awaiter(this, void 0, void 0, function* () {
        ctxProvider.set({ id });
        for (let index = 0; index < 8; index++) {
            let ctx = ctxProvider.get();
            if (ctx.id !== id) {
                throw new Error(`CTX ${id} failed. Actual: ${ctx.id}`);
            }
            else {
                console.log(`CTX ${ctx.id} ok`);
            }
            yield wait(Math.random() * 500 + 500);
            ctx = ctxProvider.get();
            if (ctx.id !== id) {
                throw new Error(`CTX ${id} failed. Actual: ${ctx.id}`);
            }
            else {
                console.log(`CTX ${ctx.id} ok`);
            }
        }
    });
}
test(ctxProvider, 1);
test(ctxProvider, 2);
test(ctxProvider, 3);
