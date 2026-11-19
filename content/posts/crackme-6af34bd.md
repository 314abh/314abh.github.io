+++
date = "2026-11-15T11:11:03+05:30"
draft = false
title = "qpdudusydi's Rust Crackme (XOR)"
description = "Writeup on the Rust (XOR) Crackme problem."
tags = ["writeup", "hacks"]
+++

This blog post is the solution to the ["Rust (XOR) Easy" Crackme
problem posted by qpdudusydi][100]. Considering it’s difficulty level
is 2.0, it was fine.

Executing the binary, we see the following.

```
Crackme Rust (XOR)
Put in your answer:
123
Wrong!
```

We see that the program has hard-coded strings:
  * “Crackme Rust (XOR)”
  * “Put in your answer:”
  * “Wrong!”

The first two strings make it easy for us to identify the entry-point
of the program. The last one also makes it easy for us to find the
conditional branch that is breaking us away from the “Correct!”
response.

Since I was on a Linux environment and booting Windows on a VM for 2.0
problem was too much effort, I opened Ghidra and found the memory
locations of the strings.
  * “Wrong!” is stored in memory at `0x14001df10`
  * “Correct!” is stored in memory at `0x14001df17`
  * “Put in your answer:” is stored in memory at `0x14001dec7`

Using the XREFs for each of the strings, we find the entry point of
the program. The de-compiler helped me see the code for the
entry-point function. It was `0x140002f20`.

It is very obvious that if the flag is password-protected, at some
point the program must perform a `memcmmp` function call. As a common
strategy, the program spills a string array as multiple byte loads at
`0x140002f6d`. At `0x1400048ec`, a call to `memcmp` occurs. This is
the only meaningful string comparison in the whole program that
targets the spilled array. However, the `memcmp` only compares sixteen
bytes. The last, seventeenth byte is `0x5a`. The only function call
from the entry point that takes the seventeenth byte is at
`0x140003082`. However, it only takes its address and doesn’t modify
it.

Observe that the authored code starts at `0x140002f20` but exhausts at
some `0x140004000`. This means we can grab valuable information by
searching `xor` instructions in this range, since the title of the
assignment itself includes “XOR”. Since the XORs are often used to
clear value in registers, we ignore such trivial instructions.

Scrolling through the hits in that range, almost all of them are the
`xor eax, eax` kind. The interesting one is at `0x140004a2e`:

```
140004a26 48 89 0c 24     MOV        qword ptr [RSP]=>local_10,param_1
140004a2a 88 44 24 0f     MOV        byte ptr [RSP + local_1],AL
140004a2e 32 01           XOR        AL,byte ptr [param_1]
140004a30 48 83 c4 10     ADD        RSP,0x10
```

This one doesn't zero a register. It takes a byte of the spilled array
and mixes it with a constant, `0x5a`, inside a loop that walks over
all sixteen bytes. The key is found at an instruction that can be
back-traced from `param_1` upward the function jobs, until one comes
to `lea r9, [rbp+0x37]` That's the "XOR" in the title.

Now the picture is complete.
  * The program reads our input.
  * Each byte of the input is XORed with `<KEY>`. [confirm direction]
  * The result is compared against the spilled array using `memcmp`
    at `0x1400048ec`.
  * If `memcmp` returns zero, we get “Correct!”. Otherwise, “Wrong!”.

The seventeenth byte, `0x5a`, never takes part in the comparison. It
looks like a leftover, so we ignore it.

Since XOR is its own inverse, we don't need to run the program
backwards. We just XOR the spilled bytes with the same key. A few
lines of Python are enough.

```python
#!/usr/bin/env python3

xor = 0x5a
bs = [0x19, 0x28, 0x6e, 0x39, 0x31, 0x37, 0x69, 0x05, 0x08, 0x2f, 0x29,
      0x6d, 0x05, 0x22, 0x6a, 0x28, 0x5a]

repr = bytes(b ^ xor for b in bs).decode("ascii")
print(repr.rstrip("\x00"), end="", flush=True)
```

This prints:

```
Cr4ckm3_Rus7_x0r
```

Plugging it in:

```
Crackme Rust (XOR)
Put in your answer:
Cr4ckm3_Rus7_x0r
Correct!
```

Done. The Rust part didn't make it any harder. Rust's string handling
and the usual runtime noise make the decompiler output look scary, but
the authored code is tiny. If you ignore everything outside of
`0x140002f20`–`0x140004000`, there is only one `memcmp` and one real
`xor` to care about. The difficulty rating of 2.0 was fair.

[100]: https://crackmes.one/crackme/6af34bd84b6d53e8802ed4e6

