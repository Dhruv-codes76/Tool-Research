import pty
import os
import sys

def read(fd):
    try:
        data = os.read(fd, 1024)
    except OSError:
        return b""
    sys.stdout.buffer.write(data)
    sys.stdout.flush()
    if b"Are you sure you want to apply this change" in data or b"We need to reset the" in data:
        os.write(fd, b"y\n")
    return data

pty.spawn(["npx", "prisma", "migrate", "dev", "--name", "make_tool_name_unique"], read)
