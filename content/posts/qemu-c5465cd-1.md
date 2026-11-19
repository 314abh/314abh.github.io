+++
date = "2026-11-15T11:11:03+05:30"
draft = false
title = "qemu / c5465cd (part 1)"
description = "An explanation of my work on my patch c5465cd to qemu."
+++

I’m not a fan of writing blog posts. But, I’m writing this to explain
to some of the engineering students in my college hostel what I do
sitting on my desk in five-hour long sessions. Since they’re freshers
and brand new to engineering, let alone computers, I’ll explain in the
most simple terms possible; sometimes even resorting to layman
terms. You will hate this if you are a professional, and I’ll ask you
to stop reading right here (you’re not the target audience). I advise
readers to keep the Wikipedia search handy throughout the post.

[QEMU][100] is a collection of [emulators][200]. An emulator is a
software that enables a computer (the _host_) to behave like any other
computer (the _guest_). Lot of Indian gamers will be familiar with
[Bluestacks][300]. Bluestacks emulates mobile Android devices on a
64-bit Windows desktop. Gamers often use it to play Android games on
larger screens. QEMU is something similar, but it’s not limited to a
particular pair of operating systems or devices. Since QEMU handles
such a large set of host-guest pairs, it’s only sensible to work in a
small subsystem of it at a time. Currently, I work in the subsystem
that emulates RISC-V devices on x86_64 devices. Technically speaking,
my work spans the codebase that compiles to the `qemu-system-riscv64`
and `qemu-riscv64` binary targets.

Yesterday, I had sufficient time to work on a bugfix for a reported
issue. The fix took one programming session (five n’ half hours). QEMU
bugfixes are sent to the maintainers via emails in standard git patch
formats. [My patch][1] is currently in the mailing list awaiting
review.

# Basics

Before diving into the source code of QEMU, it’s better to familiarize
ourselves with the RISC-V subsystem. RISC-V is an open-source
instruction set architecture (ISA). ARM and x86_64 are some other,
closed-source ISAs.

RISC-V has extensions that act as additions to the core RISC-V
architecture, hence extending its functionality. Many basic
functionalities, that we take for granted in x86_64, too are
implemented as extensions -- for example, single- and double-precision
floating points.

The issue I investigated for this patch spans three extensions in
total: TLB, Zicbom, Zicfiss. I provide a brief explanation about each
extension below, particularly the parts that are important in the
context of this issue.

# CBO.*

The Zicbom extension introduces three main instructions meant for
cache block operations.

- `CBO.CLEAN` writes back changes in a cache block to main memory
- `CBO.INVAL` de-allocates a cache block
- `CBO.FLUSH` performs a `CBO.CLEAN` followed by a `CBO.INVAL`

Before going further, I wish to clarify what is meant here by “cache
block”. A cache is structure that helps reduce latency in
fetching/writing data to a memory location. In the case of RISC-V, we
establish a cache to satisfy load and store operations from it rather
than having to fetch the provided memory address.

In RISC-V, cache is managed via _cache blocks_. Cache blocks are
nothing but range of physical addresses in memory. They’re required to
be NAPOT (naturally aligned power-of-two). But those are
implementation-specific details and we need not dive into
that. There is also the `CBO.ZERO` instruction that `memset`s cache
block at a given address. All instructions above use memory addresses
(with an optional offset depending on the Assembler) as the sole
operand.

# TLB

TLB or Translation Lookaside Buffer is a type of cache in RISC-V
processors that stores the latest series of translations of
virtual-to-physical memory addresses. I hope you’re aware that the
memory address space that software operates on is almost never the
real, physical address space. It’s abstracted away with a virtual
address space. TLB is a cache that stores translation of virtual
addresses to physical addresses. Otherwise, it’s actually a [ten step
process][3]. Most modern computers that don’t run software on the bare
metal will almost always have an address translation unit.

# Zicfiss (Shadow Stack)

The Zicfiss extension implements the [shadow stack][4]. The shadow
stack is a feature to prevent memory corruption faults and even
security problems. In usual execution of programs, the return
addresses during function calls is present on the stack, which is in
the memory section with both read and write permissions. If a stack
overflow occurs, it can overwrite the return address in the stack,
hence compromising the expected execution of the program.

# The bug

[Reported on GitLab][2], the issue was with the Zicbom extension
instructions executing on a shadow stack page in memory. The leaf PTE
in particular. According to the spec, a cache block management
instruction executed on a shadow stack page should result into access
faults. Even though it occurs for the cases when the TLB is cold, if
the TLB is warm with that page due to a prior load instruction, the
CBO instructions retire without faults. That’s the bug!

In the next post, I will dive into a fix for it. Since, the patch is
still in review, it’s wrong to say anything with certainty. My patch
has passed required tests for Debian/Arch x86_64, though.

[1]: https://lore.kernel.org/qemu-devel/20261114215908.260568-1-314abh@gmail.com/
[2]: https://gitlab.com/qemu-project/qemu/-/work_items/4789
[3]: https://docs.riscv.org/reference/isa/v20260120/priv/supervisor.html#sv32algorithm
[4]: https://www.kernel.org/doc/html/next/arch/riscv/zicfiss.html

[100]: https://wiki.qemu.org/Main_Page
[200]: https://en.wikipedia.org/wiki/Emulator
[300]: https://www.bluestacks.com/
