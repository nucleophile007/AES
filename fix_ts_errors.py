import re
import sys

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for k, v in replacements.items():
        content = content.replace(k, v)
    with open(filepath, 'w') as f:
        f.write(content)

# Fix McqPdfAssignmentModal.tsx
with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    content = f.read()

# Fix lambda variables
content = re.sub(r'\(section\)\s*=>', '(topic) =>', content)
# Fix nullability of topicId
content = re.sub(r'topicId:\s*string\s*\|\s*null;', 'topicId: string;', content)
# Fix parameter 'item' implicitly has an 'any' type in map
content = re.sub(r'\(item\)\s*=>\s*topicSet\.has\(item\.q\.topicId\)', '(item: any) => topicSet.has(item.q.topicId)', content)
content = re.sub(r'\(item\)\s*=>\s*sectionSet\.has\(item\.q\.topicId\)', '(item: any) => sectionSet.has(item.q.topicId || "")', content)
content = content.replace('sectionSet.has', 'topicSet.has')
content = content.replace('const sectionSet = new Set', 'const topicSet = new Set')
content = content.replace('cleanedSectionIds', 'cleanedTopicIds')
content = content.replace('topicById.get(existing)', 'topicById.get(existing || "")')
content = content.replace('topicById.get(question.topicId)', 'topicById.get(question.topicId || "")')
content = re.sub(r'\(subtopic\)\s*=>', '(subtopic: any) =>', content)

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.write(content)

# Fix SubmissionReviewer.tsx
fix_file('app/components/teacher/SubmissionReviewer.tsx', {
    'sectionStats:': 'topicStats:'
})

# Fix parent dashboard
fix_file('app/parent-dashboard/report/[submissionId]/page.tsx', {
    'sectionStats:': 'topicStats:'
})

# Fix student dashboard
fix_file('app/student-dashboard/report/[submissionId]/page.tsx', {
    'sectionStats:': 'topicStats:'
})

# Fix PremiumMcqReport.tsx
fix_file('components/common/PremiumMcqReport.tsx', {
    'sectionTitleNarrative': 'topicTitleNarrative',
    'sectionTitleDifficulty': 'topicTitleDifficulty',
    'sectionTitleMastery': 'topicTitleMastery',
    'sectionStats': 'topicStats',
    'sectionName': 'topicName',
    'sectionId': 'topicId',
})

print("Fixed")
