import fetch from "node-fetch";

class Queue {
  private items = <any>[];

  enqueue(item: any) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items;
  }
}

async function main1() {
  const queue = new Queue();

  queue.enqueue(fetch("https://dummyjson.com/products/1"));
  queue.enqueue(fetch("https://dummyjson.com/products/2"));
  queue.enqueue(fetch("https://dummyjson.com/products/3"));
  queue.enqueue(fetch("https://dummyjson.com/products/4"));

  // This will fail if one request fails
  // Cant really push while resolving
  // Other bs
  try {
    Promise.all(queue.peek()).then((values) => {
      values.map(async (value) => {
        console.log(await value.json());
      });
    });
  } catch (e) {
    console.error(e);
  }
}

class TaskQueue {
  queue: any[];
  private running: boolean;
  private retry: number;

  constructor() {
    this.queue = [];
    this.running = false;
    this.retry = 0;
  }

  enqueue(task: () => Promise<any>) {
    this.queue.push(task);
    if (!this.running) {
      this.processQueue();
    }
  }

  async processQueue() {
    // If no tasks pisoff
    if (this.queue.length > 0) {
      this.running = true;
      // Get the first task in the queue
      const task = this.queue.shift();

      try {
        await task().then(async (res: any) => {
          if (!res.ok) throw new Error("Invalid Request");
          console.log((await res.json()).title);
        });
        this.retry = 0;
      } catch (e) {
        // Retry 2 times
        if (this.retry < 2) {
          this.retry++;
          this.queue.unshift(task);
        } else {
          this.retry = 0;
        }
        console.error(e);
      }

      this.running = false;
      // Run the next task in the queue
      this.processQueue();
    }
  }
}

async function main2() {
  const taskQueue = new TaskQueue();

  taskQueue.enqueue(() => fetch("https://dummyjson.com/producs/1")); // Invalid Request
  taskQueue.enqueue(() => fetch("https://dummyjson.com/products/2"));
  taskQueue.enqueue(() => fetch("https://dummyjson.com/products/3"));
  taskQueue.enqueue(() => fetch("https://dummyjson.com/products/4"));
}

main2();
