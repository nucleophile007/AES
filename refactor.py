import re

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    content = f.read()

# Replace types
content = content.replace('type BulkTargetMode = "range" | "section";', 'type BulkTargetMode = "range" | "topic";')
content = content.replace('type AutoFormulaMode = "per-question" | "section" | "difficulty";', 'type AutoFormulaMode = "per-question" | "topic" | "difficulty";')
content = content.replace('sectionMinutesPerQuestion: Record<string, number>;', 'topicMinutesPerQuestion: Record<string, number>;')

# Remove McqSection interface
content = re.sub(r'interface McqSection \{.*?\n\}\n\n', '', content, flags=re.DOTALL)

# Remove sectionId from McqQuestion
content = re.sub(r'\s*sectionId:\s*string;', '', content)

# Remove sections from McqPdfConfig
content = re.sub(r'\s*sections:\s*McqSection\[\];', '', content)

# Replace section specific variables with topic specific ones
replacements = {
    'sectionMinutesPerQuestion': 'topicMinutesPerQuestion',
    'BulkTargetMode = "section"': 'BulkTargetMode = "topic"',
    'createDefaultSection': 'createDefaultTopic',
    'createQuestionFromSection': 'createQuestionFromTopic',
    'SECTION_COLORS': 'TOPIC_COLORS',
    'getSectionColor': 'getTopicColor',
    'rawSections': 'rawTopics',
    'sectionIdSet': 'topicIdSet',
    'firstSection': 'firstTopic',
    'sectionIdRaw': 'topicIdRaw',
    'rawSectionFormula': 'rawTopicFormula',
    'sectionRateMap': 'topicRateMap',
    'sectionById': 'topicById',
    'sectionStats': 'topicStats',
    'sectionName': 'topicName',
    'bulkTypeSectionIds': 'bulkTypeTopicIds',
    'bulkScoringSectionIds': 'bulkScoringTopicIds',
    'bulkPartialSectionIds': 'bulkPartialTopicIds',
    'bulkOptionCountSectionIds': 'bulkOptionCountTopicIds',
    'bulkOptionLabelSectionIds': 'bulkOptionLabelTopicIds',
    'bulkDifficultySectionIds': 'bulkDifficultyTopicIds',
    'setBulkTypeSectionIds': 'setBulkTypeTopicIds',
    'setBulkScoringSectionIds': 'setBulkScoringTopicIds',
    'setBulkPartialSectionIds': 'setBulkPartialTopicIds',
    'setBulkOptionCountSectionIds': 'setBulkOptionCountTopicIds',
    'setBulkOptionLabelSectionIds': 'setBulkOptionLabelTopicIds',
    'setBulkDifficultySectionIds': 'setBulkDifficultyTopicIds',
    'groupQuestionsBySection': 'groupQuestionsByTopic',
    'mode === "section"': 'mode === "topic"',
    'mode: "section"': 'mode: "topic"',
    'formula.mode === "section"': 'formula.mode === "topic"',
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Fix remaining instances of 'section' in variable names where appropriate
# We need to be careful with words like 'sections', 'sectionId', 'section'
content = content.replace('sectionId', 'topicId')
content = content.replace('section.', 'topic.')
content = content.replace('section?', 'topic?')
content = content.replace('.section', '.topic')

# Remove duplicate topicId from McqQuestion if it was created
content = re.sub(r'(\s*topicId:\s*string;)\s*(topicId:\s*string \| null;)', r'\2', content)

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.write(content)
