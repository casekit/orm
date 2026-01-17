export const interleave = <T, U>(xs: T[], y: U): (T | U)[] => {
    const zs: (T | U)[] = [];
    xs.forEach((x, index) => {
        zs.push(x);
        if (index < xs.length - 1) zs.push(y);
    });
    return zs;
};
