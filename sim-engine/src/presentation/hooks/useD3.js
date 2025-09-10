import { useRef, useEffect } from 'react';

export const useD3 = (renderChartFn, dependencies) => {
    const ref = useRef();

    useEffect(() => {
        renderChartFn(ref.current);
        return () => {};
      }, [renderChartFn, dependencies]);
    return ref;
}
