import sys
import re

log_file = sys.argv[1]

with open(log_file, 'r') as f:
    log_content = f.read()

errors = re.findall(r'app/components/teacher/McqPdfAssignmentModal.tsx\((\d+),(\d+)\): (.*)', log_content)

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    lines = f.readlines()

for line_num_str, col_str, msg in errors:
    line_num = int(line_num_str) - 1
    print(f"\n--- Error at {line_num_str}:{col_str} --- {msg}")
    start = max(0, line_num - 2)
    end = min(len(lines), line_num + 3)
    for i in range(start, end):
        prefix = "-> " if i == line_num else "   "
        print(f"{i+1}: {prefix}{lines[i].rstrip()}")

