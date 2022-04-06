const SEED = 5381;

const phash = (h: number, x: string): number => {
    let i = x.length;

    while (i) {
        h = (h * 33) ^ x.charCodeAt(--i);
    }

    return h;
};

// This is a djb2 hashing function
export const hash = (x: string): number => {
    return phash(SEED, x);
};
