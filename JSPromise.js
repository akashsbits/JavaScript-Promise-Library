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
    if (this.#state === STATE.FULFILLED) {
      this.#thenCallbacks.forEach((cb) => cb(this.#value));
      this.#thenCallbacks = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCallbacks.forEach((cb) => cb(this.#value));
      this.#catchCallbacks = [];
    }
  }

  #success(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      // Check if the value is a promise object
      if (value instanceof JSPromise) {
        value.then(this.#__success, this.#__fail);
        return;
      }

      this.#state = STATE.FULFILLED;
      this.#value = value;
      this.#runCallbacks();
    });
  }

  #fail(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      // Check if the value is a promise object
      if (value instanceof JSPromise) {
        value.then(this.#__success, this.#__fail);
        return;
      }

      this.#state = STATE.REJECTED;
      this.#value = value;
      this.#runCallbacks();
    });
  }

  then(successCb, failCb) {
    // Return promise for promise chaining
    return new JSPromise((resolve, reject) => {
      this.#thenCallbacks.push((result) => {
        if (successCb == null) {
          resolve(result);
          return;
        }

        try {
          resolve(successCb(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#catchCallbacks.push((result) => {
        if (failCb == null) {
          reject(result);
          return;
        }

        try {
          resolve(failCb(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#runCallbacks();
    });
  }

  catch(cb) {
    return this.then(undefined, cb);
  }

  finally(cb) {
    return this.then(
      (result) => {
        // Not passing result because finally don't receive result
        cb();
        // returning result so that any further promise can use it
        return result;
      },
      (result) => {
        cb();
        throw result;
      }
    );
  }
}

module.exports = JSPromise;
