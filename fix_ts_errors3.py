import re

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    content = f.read()

# Fix types
content = content.replace('topics: Array.isArray(raw.topics) ? raw.topics : []', 'rawTopics')
content = content.replace('const topics: McqTopic[] = rawTopics.length > 0', 'const topics: McqTopic[] = rawTopics.length > 0')

# Fix topic.id vs string
content = content.replace('const topicIdSet = new Set(topics.map((topic) => topic.id));', 'const topicIdSet = new Set(topics.map((topic: McqTopic) => topic.id));')

# Remove dupes
# content = re.sub(r'const rawTopics = (.*?);.*?\n.*?const rawTopics = \1;', r'const rawTopics = \1;', content, flags=re.DOTALL)
content = re.sub(r'const rawTopics = Array\.isArray\(raw\.topics\) \? raw\.topics : \[\];\n\s*const rawTopics = Array\.isArray\(raw\.topics\) \? raw\.topics : \[\];', 'const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];', content)

# Fix subqTopic -> subtopic
content = content.replace('subqTopic?.name', 'subtopic.name')

# Fix qTopic -> topic
content = content.replace('qTopic?.name', 'topic.name')

# Fix topic?.name -> topic.name where topic is McqTopic
content = content.replace('const topicName = topic?.name || "Section";', 'const topicName = section?.name || "Topic";')
content = content.replace('const section = topicById.get(question.topicId || "");', 'const section = topicById.get(question.topicId || "");')
content = content.replace('topic ? topic.name : "None"', 'topic ? topic.name : "None"')
content = content.replace('const qTopic = topicById.get(question.topicId || "");', 'const topic = topicById.get(question.topicId || "");')

# Fix 1174
content = content.replace('qTopic.name', 'topic.name')
content = content.replace('subqTopic.name', 'subtopic.name')
content = content.replace('subqTopic', 'subtopic')
content = content.replace('qTopic', 'topic')

# fix 2665+ string | null errors
content = content.replace('subtopicId: value || "" === NO_SUBTOPIC_VALUE ? null : value,', 'subtopicId: value === NO_SUBTOPIC_VALUE ? "" : (value || ""),')

# fix 1222 
content = content.replace('if (!topic.rangeExpression)', 'if (!topic.rangeExpression?.trim())')
content = content.replace('rangeExpression: topic.rangeExpression', 'rangeExpression: topic.rangeExpression || ""')

# remove remaining qTopic
content = content.replace('qTopic', 'topic')
content = content.replace('subqTopic', 'subtopic')

# 2670
content = content.replace('const topicId = value === NO_TOPIC_VALUE ? null : value;', 'const topicId = value === NO_TOPIC_VALUE ? "" : value;')

# fix subtopics find any
content = content.replace('topic.subtopics.find((item) => item.id', 'topic.subtopics.find((item: any) => item.id')

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.write(content)
