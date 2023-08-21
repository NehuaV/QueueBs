"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(item) {
        this.items.push(item);
    }
    dequeue() {
        return this.items.shift();
    }
    peek() {
        return this.items;
    }
}
function main1() {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = new Queue();
        queue.enqueue((0, node_fetch_1.default)("https://dummyjson.com/products/1"));
        queue.enqueue((0, node_fetch_1.default)("https://dummyjson.com/products/2"));
        queue.enqueue((0, node_fetch_1.default)("https://dummyjson.com/products/3"));
        queue.enqueue((0, node_fetch_1.default)("https://dummyjson.com/products/4"));
        // This will fail if one request fails
        // Cant really push while resolving
        // Other bs
        try {
            Promise.all(queue.peek()).then((values) => {
                values.map((value) => __awaiter(this, void 0, void 0, function* () {
                    console.log(yield value.json());
                }));
            });
        }
        catch (e) {
            console.error(e);
        }
        console.log("Peek requests", queue.peek()); // Print First
    });
}
class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = false;
        this.retry = 0;
    }
    enqueue(task) {
        this.queue.push(task);
        if (!this.running) {
            this.processQueue();
        }
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            // If no tasks pisoff
            if (this.queue.length > 0) {
                this.running = true;
                // Get the first task in the queue
                const task = this.queue.shift();
                try {
                    yield task().then((res) => __awaiter(this, void 0, void 0, function* () {
                        if (!res.ok)
                            throw new Error("Invalid Request");
                        console.log((yield res.json()).title);
                    }));
                    this.retry = 0;
                }
                catch (e) {
                    // Retry 2 times
                    if (this.retry < 2) {
                        this.retry++;
                        this.queue.unshift(task);
                    }
                    else {
                        this.retry = 0;
                    }
                    console.error(e);
                }
                this.running = false;
                // Run the next task in the queue
                this.processQueue();
            }
        });
    }
}
function main2() {
    return __awaiter(this, void 0, void 0, function* () {
        const taskQueue = new TaskQueue();
        taskQueue.enqueue(() => (0, node_fetch_1.default)("https://dummyjson.com/producs/1")); // Invalid Request
        taskQueue.enqueue(() => (0, node_fetch_1.default)("https://dummyjson.com/products/2"));
        taskQueue.enqueue(() => (0, node_fetch_1.default)("https://dummyjson.com/products/3"));
        taskQueue.enqueue(() => (0, node_fetch_1.default)("https://dummyjson.com/products/4"));
    });
}
main2();
