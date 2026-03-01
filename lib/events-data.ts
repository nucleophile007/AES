// Centralized events data
// TODO: Move this to database when Event model is created

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  image: string;
  summary?: string; // For recent events
}

export const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "SAT Prep Workshop: Mastering Math",
    date: "February 15, 2026",
    time: "10:00 AM - 12:00 PM",
    location: "Online (Zoom)",
    description: "Join our expert tutors for a deep dive into the most challenging SAT Math problems. Learn strategies to boost your score.",
    category: "Workshop",
    image: "/nav-sat.png"
  },
  {
    id: 2,
    title: "College Application Q&A Session",
    date: "February 22, 2026",
    time: "4:00 PM - 5:30 PM",
    location: "AES Center, San Jose",
    description: "Get your questions answered by former admissions officers from top universities. Perfect for juniors and seniors.",
    category: "Seminar",
    image: "/nav-college.png"
  },
  {
    id: 3,
    title: "Introduction to Research for High Schoolers",
    date: "March 5, 2026",
    time: "6:00 PM - 7:30 PM",
    location: "Online (Zoom)",
    description: "Discover how to get started with research projects and why they matter for college admissions.",
    category: "Webinar",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop"
  }
];

export const recentEvents: Event[] = [
  {
    id: 101,
    title: "Winter Science Olympiad Bootcamp",
    date: "January 18-20, 2026",
    time: "Full Day",
    location: "AES Center",
    description: "A three-day intensive bootcamp preparing students for regional Science Olympiad competitions.",
    summary: "A intensive 2-day bootcamp preparing students for regional competitions. Over 50 students participated!",
    category: "Bootcamp",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop"
  },
  {
    id: 102,
    title: "Financial Aid Application Masterclass",
    date: "January 12, 2026",
    time: "3:00 PM - 5:00 PM",
    location: "Online",
    description: "Expert guidance on navigating FAFSA, CSS Profile, and scholarship applications.",
    summary: "Students learned the art of storytelling for their personal statements with our lead writing coach.",
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop"
  }
];

export function getLatestEvent(): Event | null {
  return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
}
