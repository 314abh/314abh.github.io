+++
date = '2026-11-15T11:11:03+05:30'
draft = false
title = 'Commit c5465cd @ QEMU'
+++

As some of my readers might already be aware of, I’ve been working on
the QEMU emulator for a long time -- `qemu-system-riscv64` and
`qemu-riscv64` targets to be particular. I sent a patch fixing one of
the reported bugs today morning at 3am. I wish to discuss the issue
and fix in detail here. The target audience includes anybody who knows
even basics of any RISC architecture, and can read/write Assembly and
C. I also want to declare that [the patch][1] is currently sitting
live on the mailing list awaiting review.

# CBO.*

RISC-V has extensions that act as additions to the core RISC-V
architecture, hence extending its functionality. Many basic
functionalities, that we take for granted in x86_64, too are
implemented as extensions -- for example, single- and double-precision
floating points.

One such extension is the CMO extension (Cache Management Operation),
formally called the Zicbom extension. It introduces the following
instructions:

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

Mind that all I explain here is a bird-eye overview of things. I’m
delving into every tiny detail. The RISC-V spec is huge and has lot of
things to worry about if you will.

# TLB

TLB or Translation Lookaside Buffer is a type of cache in RISC-V
processors that stores the latest series of translations of
virtual-to-physical memory addresses. I hope you’re aware that the
memory address space that software operates on is almost never the
real, physical address space. It’s abstracted away with a virtual
address space. TLB is a cache that stores translation of virtual
addresses to physical addresses. Otherwise, it’s actually a [ten step
process][3]. I won’t go into the details of that.

# Zicfiss (Shadow Stack)

The Zicfiss extension implements the [shadow stack][4]. The shadow
stack is a feature to prevent memory corruption faults and even
security problems. In usual execution of programs, the return
addresses during function calls is present on the stack, which is in
the memory section with both read and write permissions. If a stack
overflow occurs, it can overwrite the return address in the stack,
hence compromising the expected execution of the program. Again, I’m
oversimplifying a lot.

# The bug

[The issue][2] causes 

[Reported on GitLab][2], the issue was with the Zicbom extension
instructions executing on a shadow stack page in memory. The leaf PTE
in particular. According to the spec, a cache block management
instruction executed on a shadow stack page should result into access
faults. Even though it occurs for the cases when the TLB is cold, if
the TLB is warm with that page due to a prior load instruction, the
CBO instructions retire without faults. That’s the bug!

I will update this blog in some time. I know it’s not complete.

[1]: https://lore.kernel.org/qemu-devel/20261114215908.260568-1-314abh@gmail.com/
[2]: https://gitlab.com/qemu-project/qemu/-/work_items/4789
[3]: https://docs.riscv.org/reference/isa/v20260120/priv/supervisor.html#sv32algorithm
[4]: https://www.kernel.org/doc/html/next/arch/riscv/zicfiss.html
