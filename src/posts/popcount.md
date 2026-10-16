---
title: "Counting bits, and why the obvious loop is slow"
date: 2026-10-14
summary: "From a naive popcount to the SWAR trick, with a little bit of math."
tags: ["c", "bit-tricks"]
math: true
---

Counting the set bits in a word &mdash; *population count*, or `popcount` &mdash;
shows up everywhere: sparse sets, Hamming distance, error-correcting codes,
and half the interview questions ever asked about integers.

Formally, for a $w$-bit word $x$, we want

$$
\operatorname{popcount}(x) \;=\; \sum_{i=0}^{w-1} \bigl\lfloor x / 2^{i} \bigr\rfloor \bmod 2 .
$$

## The obvious loop

The definition translates directly into code, and it runs in $O(w)$ &mdash;
one iteration per bit, regardless of how many bits are actually set:

```c
int popcount_naive(unsigned long x) {
    int count = 0;
    while (x) {
        count += x & 1UL;
        x >>= 1;
    }
    return count;
}
```

That is fine and clear, but on a 64-bit word it always does 64 shifts.

## Better: clear the lowest set bit

A classic trick is `x & (x - 1)`, which clears the lowest set bit in one
operation. Looping on that runs in $O(k)$, where $k = \operatorname{popcount}(x)$:

```c
int popcount_kernighan(unsigned long x) {
    int count = 0;
    while (x) {
        x &= x - 1;
        count++;
    }
    return count;
}
```

## Best: SWAR

*SIMD Within A Register* treats a single register as a vector of narrower
lanes. The mask `0x5555...` isolates every other bit, letting us count pairs,
then nibbles, then bytes, in a constant number of steps:

$$
\text{popcount}(x) = \text{bytesum}\Bigl(\underbrace{x - ((x \gg 1) \,\&\, M_1)}_{\text{pair sums}} \;\text{folding}\Bigr),
\qquad M_1 = \texttt{0x5555}\ldots
$$

```c
int popcount_swar(unsigned long x) {
    x = x - ((x >> 1) & 0x5555555555555555UL);
    x = (x & 0x3333333333333333UL) + ((x >> 2) & 0x3333333333333333UL);
    x = (x + (x >> 4)) & 0x0F0F0F0F0F0F0F0FUL;
    return (int)((x * 0x0101010101010101UL) >> 56);
}
```

Constant time, no branches. On most modern CPUs you should just call the
builtin and let the compiler emit `POPCNT`:

```c
int popcount(unsigned long x) {
    return __builtin_popcountl(x);
}
```

The lesson is the usual one: measure before you optimize, then let the
hardware do the counting.
