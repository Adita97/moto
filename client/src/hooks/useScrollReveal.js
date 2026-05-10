import { useInView } from "react-intersection-observer";

export function useScrollReveal(options = {}) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  });

  return { ref, inView };
}
