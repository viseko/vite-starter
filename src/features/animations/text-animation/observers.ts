export function observe(
  element: HTMLElement,
  animationName: string,
  speed = 500,
  delay = 0,
  gap = 50
) {
  speed = Number(speed);
  delay = Number(delay);
  gap = Number(gap);

  const parts = element.querySelectorAll(".text-part, .text-line") as NodeListOf<HTMLElement>;

  const anim = (el: HTMLElement, i: number) => {
    const totalDelay = delay + i * gap;
    el.style.animation = `${animationName} ${speed}ms ease ${totalDelay}ms both`;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          parts.forEach((el: HTMLElement, i: number) => anim(el, i));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(element);
}
