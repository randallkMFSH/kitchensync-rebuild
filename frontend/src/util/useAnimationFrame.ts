import { DependencyList, useEffect } from "react";

export function useAnimationFrame(frameFunc: (time: number) => void, deps: DependencyList) {
    return useEffect(() => {
        let animationFrameHandle: number;
        const update = (time: number) => {
            animationFrameHandle = requestAnimationFrame(update);
            frameFunc(time);
        };
        animationFrameHandle = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameHandle);
    }, deps);
}
