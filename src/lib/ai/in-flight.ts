const inFlightRequests = new Map<string, Promise<unknown>>();

export function getInFlightRequest<T>(key: string): Promise<T> | null {
  const existing = inFlightRequests.get(key);
  return (existing as Promise<T> | undefined) ?? null;
}

export function setInFlightRequest<T>(key: string, promise: Promise<T>) {
  inFlightRequests.set(key, promise);

  promise.finally(() => {
    if (inFlightRequests.get(key) === promise) {
      inFlightRequests.delete(key);
    }
  });
}
