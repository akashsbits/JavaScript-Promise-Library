// Custom implementation of JavaScript Promise
const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class JSPromise {
  #thenCallbacks = [];
  #catchCallbacks = [];
  #state = STATE.PENDING;
  #value;
  #__success = this.#success.bind(this);
  #__fail = this.#fail.bind(this);

  constructor(cb) {
    try {
      cb(this.#__success, this.#__fail);
    } catch (e) {
      this.#__fail(e);
    }
  }

  #runCallbacks() {
    if (this.state === STATE.FULFILLED) {
      this.#thenCallbacks.forEach((cb) => cb(this.#value));
      this.#thenCallbacks = [];
    }

    if (this.state === STATE.REJECTED) {
      this.#catchCallbacks.forEach((cb) => cb(this.#value));
      this.#catchCallbacks = [];
    }
  }

  #success(value) {
    if (this.#state !== STATE.PENDING) return;

    this.#state = STATE.FULFILLED;
    this.#value = value;
  }

  #fail(value) {
    if (this.#state !== STATE.PENDING) return;

    this.#state = STATE.REJECTED;
    this.#value = value;
  }

  then(successCb, failCb) {
    if (successCb != null) this.#thenCallbacks.push(cb);

    if (failCb != null) this.#catchCallbacks.push(cb);

    this.#runCallbacks();
  }

  catch(cb) {
    return this.then(undefined, cb);
  }
}
