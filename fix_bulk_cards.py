with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'r') as f:
    content = f.read()

# Replace bulk card logic references
content = content.replace('value="section"', 'value="topic"')
content = content.replace('By Section', 'By Topic')
content = content.replace('>Sections</Label>', '>Topics</Label>')
content = content.replace('getSectionSelectionLabel', 'getTopicSelectionLabel')
content = content.replace('pruneSectionSelections', 'pruneTopicSelections')
content = content.replace('toggleSectionSelection', 'toggleTopicSelection')

# Replace state variables
content = content.replace('bulkTypeSectionIds', 'bulkTypeTopicIds')
content = content.replace('bulkScoringSectionIds', 'bulkScoringTopicIds')
content = content.replace('bulkPartialSectionIds', 'bulkPartialTopicIds')
content = content.replace('bulkOptionCountSectionIds', 'bulkOptionCountTopicIds')
content = content.replace('bulkOptionLabelSectionIds', 'bulkOptionLabelTopicIds')
content = content.replace('bulkDifficultySectionIds', 'bulkDifficultyTopicIds')

content = content.replace('setBulkTypeSectionIds', 'setBulkTypeTopicIds')
content = content.replace('setBulkScoringSectionIds', 'setBulkScoringTopicIds')
content = content.replace('setBulkPartialSectionIds', 'setBulkPartialTopicIds')
content = content.replace('setBulkOptionCountSectionIds', 'setBulkOptionCountTopicIds')
content = content.replace('setBulkOptionLabelSectionIds', 'setBulkOptionLabelTopicIds')
content = content.replace('setBulkDifficultySectionIds', 'setBulkDifficultyTopicIds')

# Replace config.sections map inside the JSX bulk cards
# They look like: config.sections.length > 0 && pruneTopicSelections(bulkTypeTopicIds).length === config.sections.length
# and config.sections.map((section) => ( ... ))
content = content.replace('config.sections', 'config.topics')
content = content.replace('config.topics.map((section)', 'config.topics.map((topic)')
content = content.replace('section.id', 'topic.id')
content = content.replace('section.name', 'topic.name')

with open('app/components/teacher/McqPdfAssignmentModal.tsx', 'w') as f:
    f.write(content)

print("Done")
