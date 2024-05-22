export function LogMethodExecutionTime(): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> => {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const now = Date.now();
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((res: any) => {
          console.log(
            `${ target.constructor.name }.${ String(propertyKey) } executed in ${
              Date.now() - now
            }ms`,
          );
          return res;
        });
      } else {
        console.log(
          `${ target.constructor.name }.${ String(propertyKey) } executed in ${
            Date.now() - now
          }ms`,
        );
        return result;
      }
    };

    return descriptor;
  };
}
