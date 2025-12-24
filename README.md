# Low-Latency-Matching-Engine

A high-performance electronic exchange simulator built in modern C++,
designed to explore low-latency systems, concurrency, and networking
fundamentals used in high-frequency trading systems.

## Features
- Price-time priority limit order book
- Concurrent TCP clients using non-blocking I/O (epoll)
- Binary wire protocol for minimal serialization overhead
- Lock-minimized matching engine design
- Microsecond-level latency instrumentation
- Linux-first implementation

## Architecture
- TCP server receives orders via a custom binary protocol
- Orders are passed to the matching engine through a low-contention queue
- Matching engine executes trades against an in-memory limit order book
- End-to-end latency is measured from socket read to trade execution

## Performance
- Supports 100k+ orders/sec on a single machine
- P50 latency: ~XX µs
- P99 latency: ~YY µs
(Tested on Linux, x86_64)

## Tech Stack
- C++17
- Linux sockets (TCP)
- epoll
- std::atomic
- CMake

## Why This Project
This project was built to gain hands-on experience with performance-critical,
latency-sensitive systems where correctness and determinism matter.
It mirrors the core components of real-world trading infrastructure.

## Build & Run
```bash
mkdir build && cd build
cmake ..
make
./matching_engine
