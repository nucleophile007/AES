import os
import re
import json

def audit_badges(directory):
    badge_pattern = re.compile(r'(<Badge[^>]*>.*?</Badge>)', re.DOTALL)
    files_with_badges = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Check if it has Badge import
                if 'Badge' not in content:
                    continue
                    
                matches = badge_pattern.finditer(content)
                badges = []
                for match in matches:
                    badge_text = match.group(1)
                    start_idx = match.start()
                    # extract 5 lines around it to see context
                    context_start = max(0, content.rfind('\n', 0, start_idx) - 200)
                    context_end = min(len(content), content.find('\n', match.end()) + 500)
                    context = content[context_start:context_end]
                    badges.append({
                        "badge": badge_text,
                        "context": context
                    })
                
                if badges:
                    files_with_badges.append({
                        "file": filepath,
                        "badges": badges
                    })
                    
    with open('badge_audit.json', 'w') as f:
        json.dump(files_with_badges, f, indent=2)

if __name__ == "__main__":
    audit_badges('app')
