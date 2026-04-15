# API Route Security Matrix

Generated: 2026-04-13T14:31:24.461Z

- Total routes: 87
- Auth-gated: 43
- QStash-signed: 4
- Dev-only: 12
- Public: 28

## Legend

- gate: public | auth | qstash-signed | *+dev-only
- roles: teacher|student|parent if explicitly checked
- ownership: yes when endpoint includes explicit identity/relationship scoping logic

## Routes

| route | gate | roles | ownership | notes |
|---|---|---|---|---|
| app/api/assignments/route.ts | dev-only | - | - | legacy mock/demo endpoint (development-only) |
| app/api/auth/activate/route.ts | public | - | - | - |
| app/api/auth/google-calendar/callback/route.ts | public | - | - | public callback; signed OAuth state verification enforced |
| app/api/auth/google-calendar/route.ts | auth | teacher | yes | - |
| app/api/auth/login/route.ts | public | - | - | session endpoint; identity verified by cookie/token flow |
| app/api/auth/logout/route.ts | public | - | - | session endpoint; identity verified by cookie/token flow |
| app/api/auth/me/route.ts | auth | - | - | - |
| app/api/auth/password-reset/confirm/route.ts | public | - | - | - |
| app/api/auth/password-reset/request/route.ts | public | - | - | - |
| app/api/auth/refresh/route.ts | public | - | - | session endpoint; identity verified by cookie/token flow |
| app/api/availability/route.ts | public | - | - | - |
| app/api/blogs/route.ts | public | - | - | - |
| app/api/book-session/route.ts | public | - | - | - |
| app/api/contact/route.ts | public | - | - | - |
| app/api/debug/create-message/route.ts | dev-only | - | - | development-only debug endpoint |
| app/api/debug/dashboard/route.ts | dev-only | - | - | development-only debug endpoint |
| app/api/debug/messages/route.ts | dev-only | - | - | development-only debug endpoint |
| app/api/debug/setup-chat/route.ts | dev-only | - | - | development-only debug endpoint |
| app/api/debug/view-messages/route.ts | dev-only | - | - | development-only debug endpoint |
| app/api/demo/route.ts | dev-only | - | - | legacy mock/demo endpoint (development-only) |
| app/api/events/[id]/route.ts | public | - | - | - |
| app/api/events/all/route.ts | public | - | - | - |
| app/api/events/latest/route.ts | public | - | - | - |
| app/api/events/register/route.ts | public | - | - | - |
| app/api/events/route.ts | public | - | - | - |
| app/api/jobs/contact-notification/route.ts | qstash-signed | - | - | queue/webhook signature required |
| app/api/jobs/schedule-reminders/route.ts | qstash-signed | - | - | queue/webhook signature required |
| app/api/jobs/send-emails/route.ts | qstash-signed | - | - | queue/webhook signature required |
| app/api/jobs/update-sheet/route.ts | qstash-signed | - | - | queue/webhook signature required |
| app/api/mentors/route.ts | public | - | - | - |
| app/api/messages/mark-read/route.ts | auth | - | yes | - |
| app/api/messages/parent/route.ts | auth | parent | yes | parentId is bound to authenticated user |
| app/api/messages/route.ts | dev-only | - | - | legacy mock/demo endpoint (development-only) |
| app/api/messages/send/route.ts | auth | - | yes | recipient relationship checks enforced |
| app/api/messages/student/route.ts | auth | student | yes | - |
| app/api/messages/teacher/route.ts | auth | teacher | yes | - |
| app/api/messages/unread-count/route.ts | auth | - | yes | - |
| app/api/parent/calender/route.ts | auth | parent | yes | parent-scoped via authenticated email |
| app/api/parent/feedback/route.ts | auth | parent | yes | - |
| app/api/parent/mentors/route.ts | auth | parent | - | - |
| app/api/parent/progress-report/route.ts | auth | parent | yes | verifies parent-to-student relationship |
| app/api/parent/student-progress/route.ts | auth | parent | yes | - |
| app/api/parent/students/route.ts | auth | parent | yes | parent-scoped via authenticated email |
| app/api/parent/testimonial/route.ts | auth | parent | yes | - |
| app/api/parent/transaction-receipt/route.ts | auth | parent | yes | - |
| app/api/parent/upload/route.ts | auth | parent | yes | upload path is scoped to authenticated parent ID |
| app/api/ping/route.ts | public | - | - | - |
| app/api/pusher/auth/route.ts | auth | teacher|student | yes | - |
| app/api/r2-diagnostic/route.ts | dev-only | - | - | - |
| app/api/r2-upload/route.ts | auth | student | yes | - |
| app/api/research/check-access/route.ts | public | - | - | - |
| app/api/research/pdf/route.ts | public | - | - | - |
| app/api/research/presentation/full/route.ts | public | - | - | - |
| app/api/research/presentation/meta/route.ts | public | - | - | - |
| app/api/research/presentation/preview/route.ts | public | - | - | - |
| app/api/research/request-access/route.ts | public | - | - | - |
| app/api/research/route.ts | public | - | - | - |
| app/api/student/assignments/route.ts | auth | student | yes | - |
| app/api/student/dashboard/route.ts | auth | student | yes | - |
| app/api/student/mentors/route.ts | auth | student | yes | studentEmail must match authenticated user |
| app/api/student/progress-report/route.ts | auth | student | yes | - |
| app/api/student/resources/route.ts | auth | student | yes | - |
| app/api/student/resources/view/route.ts | auth | student | yes | - |
| app/api/student/route.ts | dev-only | - | - | legacy mock/demo endpoint (development-only) |
| app/api/student/schedule/route.ts | auth | teacher|student | yes | - |
| app/api/student/submissions/resources/route.ts | auth | student | yes | - |
| app/api/student/submissions/route.ts | auth | student | yes | - |
| app/api/student/teachers/route.ts | auth | student | yes | - |
| app/api/submissions/route.ts | dev-only | - | - | legacy mock/demo endpoint (development-only) |
| app/api/teacher/assignments/route.ts | auth | teacher | yes | - |
| app/api/teacher/calendar/status/route.ts | auth | teacher | yes | - |
| app/api/teacher/calendar/sync/route.ts | auth | teacher | yes | - |
| app/api/teacher/conversations/route.ts | auth | teacher | yes | conversation scope is bound to authenticated teacher ID |
| app/api/teacher/meeting-notes/route.ts | auth | teacher | yes | - |
| app/api/teacher/progress-report/route.ts | auth | teacher | yes | - |
| app/api/teacher/resources/route.ts | auth | teacher | yes | - |
| app/api/teacher/schedule/route.ts | auth | teacher | yes | - |
| app/api/teacher/student-groups/route.ts | auth | teacher | yes | - |
| app/api/teacher/student-progress/route.ts | auth | teacher | yes | - |
| app/api/teacher/students/route.ts | auth | teacher | yes | - |
| app/api/teacher/submissions/resources/route.ts | auth | teacher | yes | - |
| app/api/teacher/submissions/route.ts | auth | teacher | yes | - |
| app/api/test-r2-connection/route.ts | dev-only | - | - | - |
| app/api/testimonials/before-after/route.ts | public | - | - | - |
| app/api/testimonials/parent-testimonials/route.ts | public | - | - | - |
| app/api/testimonials/route.ts | public | - | - | - |
| app/api/upload-r2/route.ts | auth | student | yes | - |
