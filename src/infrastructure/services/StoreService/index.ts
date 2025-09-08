class StoreService {
  addInMap = (store: Map<any, any>, ip: string) => {
    const { key, value } = this.generateData(ip);
    store.set(key, value);
    return value;
  };

  readFromMap = (store: Map<any, any>, key: string) => store.get(key);

  removeItem = (store: Map<any, any>, key: string) => store.delete(key);
  clearMap = (store: Map<any, any>) => store.clear();

  cleanByExpiredTime = (store: Map<any, any>, lastModified: number) => {
    const expired = new Date() >= new Date(lastModified);
    if (expired) this.clearMap(store);
  };

  validateIfItIsOnTheBlacklist = (store: Map<any, any>, ip: string) => {
    const timeLimit = this.readFromMap(store, ip);
    if (timeLimit) {
      const expired = new Date() >= new Date(timeLimit);
      if (expired) {
        this.removeItem(store, ip);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  generateData = (id: string) => {
    return { key: id, value: this.defineTimeLimit() };
  };
  defineTimeLimit = () => {
    const now = Date.now();
    const expiresTime = process.env.BUSINESS_RULE_EXPIRES_TIME??14;
    const futureTime = Number(expiresTime) * 60 * 1000;
    const expires_in = now + futureTime;
    return expires_in;
  };
}

export default StoreService;
