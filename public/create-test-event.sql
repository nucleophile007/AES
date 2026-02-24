/**
 * Script to create a test event in the database
 * Run this with: node public/create-test-event.js
 * Or: npm run dev and visit this in browser
 */

-- SQL to insert a test event
-- Copy and paste this into your database client (like Supabase SQL Editor)

INSERT INTO "GeneralEvent" (
  "title",
  "description",
  "category",
  "eventDate",
  "eventTime",
  "location",
  "image",
  "maxParticipants",
  "registrationDeadline",
  "status",
  "isPublished",
  "isFeatured",
  "targetAudience",
  "requirements",
  "agenda",
  "registrationFormConfig",
  "customFields",
  "registrationFee",
  "earlyBirdFee",
  "earlyBirdDeadline",
  "requiresPayment",
  "contactEmail",
  "contactPhone",
  "createdAt",
  "updatedAt"
) VALUES (
  'AI & Machine Learning Workshop',
  'Join us for an exciting hands-on workshop where you''ll learn the fundamentals of artificial intelligence and machine learning. Build your first ML model and understand how AI is shaping the future!',
  'Workshop',
  '2026-03-15 10:00:00+00',
  '10:00 AM - 4:00 PM',
  'AES Center, Building A',
  '/hero.png',
  30,
  '2026-03-10 23:59:59+00',
  'upcoming',
  true,
  true,
  'High school students interested in AI and technology (Grades 9-12)',
  'Basic understanding of mathematics. Laptop required.',
  '10:00 AM - Introduction to AI
11:00 AM - Machine Learning Basics
12:00 PM - Lunch Break
1:00 PM - Hands-on Project
3:00 PM - Project Presentations
4:00 PM - Q&A and Closing',
  '{
    "studentPhone": "required",
    "studentGrade": "required",
    "schoolName": "optional",
    "parentPhone": "required",
    "specialRequirements": "optional"
  }'::jsonb,
  '[
    {
      "name": "programmingExperience",
      "label": "Programming Experience",
      "type": "select",
      "options": ["Beginner", "Intermediate", "Advanced"],
      "required": true
    },
    {
      "name": "laptopAvailable",
      "label": "Will you bring a laptop?",
      "type": "select",
      "options": ["Yes", "No - Need to borrow"],
      "required": true
    },
    {
      "name": "dietaryRestrictions",
      "label": "Dietary Restrictions",
      "type": "textarea",
      "placeholder": "Any allergies or dietary requirements for lunch...",
      "required": false
    }
  ]'::jsonb,
  150.00,
  120.00,
  '2026-03-01 23:59:59+00',
  true,
  'info@acharyaes.com',
  '+1-234-567-8900',
  NOW(),
  NOW()
);

-- To verify the event was created:
SELECT id, title, "isPublished", "isFeatured", "eventDate" 
FROM "GeneralEvent" 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- To delete test events (if needed):
-- DELETE FROM "GeneralEvent" WHERE title LIKE '%Workshop%';
