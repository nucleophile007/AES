import re
import sys

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    content = f.read()

# Add color and rangeExpression to McqTopic if missing
if 'color: string;' not in content and 'color?: string;' not in content.split('interface McqTopic')[1].split('}')[0]:
    content = content.replace('name: string;', 'name: string;\n  color?: string;\n  rangeExpression?: string;')

# Fix (989,12): Cannot find name 'topic'.
# It was: sections: [...prev.topics, section],
# Now it should be: topics: [...prev.topics, topic],
# I'll just change "section" to "topic" in the relevant lines
content = re.sub(r'const section = createDefaultTopic\(config\.topics\.length\);\n(.*?)sections: \[\.\.\.prev\.topics, section\],',
                 r'const topic = createDefaultTopic(config.topics.length);\n\1topics: [...prev.topics, topic],', content, flags=re.DOTALL)

# Fix setSection to setTopic
content = content.replace('const setSection = (topicId: string, updater: (section: McqSection) => McqSection) => {',
                          'const setTopic = (topicId: string, updater: (topic: McqTopic) => McqTopic) => {')
content = content.replace('updater(section) : section)) }));', 'updater(topic) : topic)) }));')
content = content.replace('sections: prev.topics.map((section)', 'topics: prev.topics.map((topic)')

# Fix (1054,15) and (1111,15): null to string
# topicId: null -> topicId: ""
# subtopicId: null -> subtopicId: ""
content = content.replace('topicId: null', 'topicId: ""')
content = content.replace('subtopicId: null', 'subtopicId: ""')
# In McqQuestion, ensure subtopicId is string
content = re.sub(r'subtopicId:\s*string\s*\|\s*null;', 'subtopicId: string;', content)
# Also change topicId: string | null to topicId: string if not done already
content = re.sub(r'topicId:\s*string\s*\|\s*null;', 'topicId: string;', content)

# Fix implicit any for item
content = re.sub(r'\(item\)\s*=>\s*topicById\.get', '(item: any) => topicById.get', content)
content = re.sub(r'\(item\)\s*=>\s*setQuestion', '(item: any) => setQuestion', content)

# Fix (1217,14) Cannot find name 'topic'
# for (const section of config.topics) {
content = content.replace('for (const section of config.topics) {', 'for (const topic of config.topics) {')
content = content.replace('if (!section.rangeExpression', 'if (!topic.rangeExpression')
content = content.replace('rangeExpression: section.rangeExpression', 'rangeExpression: topic.rangeExpression')
content = content.replace('const topicNameA = topicById.get(existing || "")?.name || "Another section";', 'const topicNameA = topicById.get(existing || "")?.name || "Another topic";')

# Fix (1243,20): rangeExpression on McqTopic
content = content.replace('if (!topic.rangeExpression.trim()) return section;', 'if (!topic.rangeExpression?.trim()) return topic;')
content = content.replace('return section;', 'return topic;')
content = content.replace('sections: prev.topics.map((topic) => {', 'topics: prev.topics.map((topic) => {')

# Fix (2666,76): string | null not assignable to string
content = content.replace('topicId: value', 'topicId: value || ""')
content = content.replace('topicId: string | null', 'topicId: string')

# Fix (2752,45): Block-scoped variable 'topic' used before its declaration.
# const section = topicById.get(question.topicId);
# Probably I replaced it with `const topic = ...` but `topic` is used outside.
content = content.replace('const topic = topicById.get(question.topicId);', 'const qTopic = topicById.get(question.topicId);')
content = content.replace('topic.name', 'qTopic?.name')

# Write back
with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.write(content)
