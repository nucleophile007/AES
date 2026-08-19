import os
import re

def remove_title_badges(directory):
    # Match <Badge ...> ... </Badge> where the Badge tag contains 'mb-' (e.g., 'mb-4', 'mb-6')
    # Use re.sub to remove them. We can also try to match leading whitespace to remove the whole line cleanly if it's the only thing on the line.
    
    # Pattern explanation:
    # ^[ \t]*  - optional leading whitespace
    # <Badge[^>]*mb-[^>]*> - opening tag with mb-
    # .*? - non-greedy content
    # </Badge> - closing tag
    # [ \t]*\n? - optional trailing whitespace and newline
    # Since Badge can span multiple lines, we'll use a multi-line regex
    
    # Actually, let's just find the <Badge> to </Badge> match, check if the opening tag has 'mb-', and remove it.
    badge_pattern = re.compile(r'([ \t]*)<Badge([^>]*)>(.*?)</Badge>([ \t]*\n?)', re.DOTALL)
    
    files_changed = 0
    badges_removed = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                if 'Badge' not in content:
                    continue
                
                new_content = content
                
                def replace_func(match):
                    nonlocal badges_removed
                    leading_ws = match.group(1)
                    attrs = match.group(2)
                    inner_content = match.group(3)
                    trailing = match.group(4)
                    
                    if 'mb-' in attrs:
                        badges_removed += 1
                        # If the badge is commented out with // we should probably remove the // too, 
                        # but simple regex might leave // behind. Let's just remove the matched part.
                        return '' 
                    else:
                        return match.group(0)

                new_content = badge_pattern.sub(replace_func, new_content)
                
                # We should also handle cases where the badge is commented out block like {/* <Badge ...> ... </Badge> */} ?
                # Or just let it be.
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    files_changed += 1
                    
    print(f"Changed {files_changed} files.")
    print(f"Removed {badges_removed} badges.")

if __name__ == "__main__":
    remove_title_badges('app')
