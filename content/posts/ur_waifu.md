+++
date = '2023-01-30T14:30:48+05:30'
draft = false
title = 'How ur_waifu works'
tags = ['cybersec', 'hacks']
+++

A few months back I conceived the idea of a new computer worm. I was inspired
to do so when I read about ‘ILOVEYOU’, once one of the deadliest malware on the
web. I will not be uploading the malware I created on the internet for obvious
reasons and can neither host the source code on GitHub because it violates the
terms and conditions. But, anyway, here is an explanation to how the malware
works.

The malware can be executed only on computer running Windows 8 or above. I have
not tested it on Windows 7, but it should work properly on that too. The
malware is called ‘ur_waifu’ (pronounced as ‘your waifu’). I will not say that
it is a virus. It is very much like a computer worm, but it needs to be
manually executed.

Once the program starts, the first thing it does is start replicating into
`C:\\Users\\<USER>\\AppData\\Roaming\\Microsoft\\Windows\\Start
Menu\\Programs\\Startup`. Each replica will be titled by a random number of
thirty-two characters — for example `0293472037420929456376542474556.exe`. The
program, at this moment, does not harm the computer at all. Instead, it
silently runs in the background and creates a flat file database of all
potential directories it can find to replicate into later, matched with a
corresponding Boolean stating if it has been infected. All Boolean values for
now will be set to false. To scan directories, the program first enters the C
drive and accesses folders within folders. Although my implementation of the
database is quite cliché as it stored data in tables, you may try storing data
as a different data structure (like trees) for better performance. The number
of replicas in the startup directory should be at least one-third of the total
number of directories scanned.

The previous step is so intricately planned for a reason. We will later need to
execute several instances of our program. This could’ve been possible with
multithreading or by executing our replicas. However, Windows Security by
default does not allow programs to execute other programs. Hence, we are left
with only one option: multithreading. This solution may appear like the last
hope, but there is an even better way. If you perform multithreading, it
becomes your responsibility to manage memory and solve any deadlocks. However,
we can leave this to the operating system itself. This makes our life easier,
especially when programming in C/C++.

Our malware is now ready for attack once the computer reboots. As soon as the
computer turns on and the user logs in, the program first loads its own binary
executable file and the complete flat file database into memory as a hash
table. If the database has been deleted or could not be found, the first step
shall be repeated again. Since the operating system would have already started
multiple instances of the worm. So, our program can randomly choose any of the
locations in it and start filling it; this process should be repeated several
times in the program’s lifecycle until the whole disk is full.

There are two more functionalities in the program, including the trick to enter
the ‘System32’ directory, that I will post next. So, stay tuned till the next
Monday.
