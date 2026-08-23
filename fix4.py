import re

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    lines = f.readlines()

def replace_in_line(line_num, old, new):
    lines[line_num - 1] = lines[line_num - 1].replace(old, new)

# 230: const createDefaultTopic = (index = 0): McqSection => ({
replace_in_line(230, 'McqSection', 'McqTopic')

# 237: const createQuestionFromTopic = (section: McqSection): McqQuestion => ({
replace_in_line(237, 'section: McqSection', 'topic: McqTopic')

# 239: topicId: topic.id,
# 240: topicId: "",
lines[238] = '  topicId: topic.id,\n'
lines[239] = '  subtopicId: "",\n'
lines[240] = '  type: "single",\n'

# 257: const autoTimeFormula = createDefaultAutoTimeFormula(topic.id);
# 258: const questions = Array.from({ length: defaultQuestionCount }, () => createQuestionFromTopic(section));
replace_in_line(257, 'topic.id', 'topic.id') # Actually 'topic.id' is fine if 'const topic = createDefaultTopic(0)' is above it.
lines[256] = '  const topic = createDefaultTopic(0);\n'
replace_in_line(258, 'section', 'topic')

# 269: sections: [section],
lines[268] = '' # Delete it because 'topics: [topic]' is likely added below? Wait, topics: [] is at 270. Let's just remove sections.

# 300, 301, 308, 309: topicId: null
replace_in_line(300, 'topicId: null', 'topicId: ""')
replace_in_line(301, 'subtopicId: null', 'subtopicId: ""')
replace_in_line(308, 'topicId: null', 'topicId: ""')
replace_in_line(309, 'subtopicId: null', 'subtopicId: ""')

# 375: const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];
# 377: const sections: McqSection[] = rawTopics.length > 0
# I will just remove the whole sections parsing logic, it's redundant because topics are parsed on 391.
for i in range(374, 390):
    lines[i] = ''

# 426, 428: Cannot redeclare topicIdRaw
replace_in_line(428, 'const topicIdRaw = typeof q.topicId === "string" ? q.topicId : "";', '')
replace_in_line(426, 'const topicIdRaw = typeof q.topicId === "string" ? q.topicId : "";', 'const topicIdRaw = typeof q.topicId === "string" ? q.topicId : "";')

# 435, 436, 437: Type 'string | null' is not assignable to type 'string'
lines[434] = '          topicId: topicId || "",\n'
lines[435] = '          subtopicId: subtopicId || "",\n'
lines[436] = '          type: q.type === "multiple" ? "multiple" : "single",\n'

# 497: sections,
lines[496] = ''

# 578: const topicById = useMemo(() => {
# 579:   const map = new Map<string, McqSection>();
# 580:   config.topics.forEach((topic) => map.set(topic.id, section));
for i in range(577, 582):
    lines[i] = ''
    
# 949: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
replace_in_line(949, 'topic.name', 'topic.name || ""')

# 1221, 1222: 'topic.rangeExpression' is possibly 'undefined'.
replace_in_line(1221, 'if (!topic.rangeExpression?.trim())', 'if (!(topic.rangeExpression || "").trim())')
replace_in_line(1222, 'topic.rangeExpression || ""', 'topic.rangeExpression || ""')

# 2121, 2123: setSection
replace_in_line(2121, 'setSection', 'setTopic')
replace_in_line(2121, '(c)', '(c: any)')
replace_in_line(2123, 'setSection', 'setTopic')
replace_in_line(2123, '(c)', '(c: any)')

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.writelines(lines)
