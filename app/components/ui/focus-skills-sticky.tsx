"use client"

import React from "react"
import { CreatorverseStickyScroll } from "./creatorverse-sticky-scroll"

const skillsContent = [
  {
    title: "Reading",
    description:
      "Develop your critical thinking and analytical skills. Reviewer for Student Newsletters/Journals, Content copy writer for digital media campaigns, Start a review blog, YouTube channel, or Instagram Reels on book summaries, reading challenges, or author interviews.",
    content: <img src="/aes-creatorverse/reading.png" alt="Reading and learning" className="w-full h-full object-cover" />,
  },
  {
    title: "Writing",
    description:
      "Express your creativity and share your ideas with the world. Run a blog/Publish a book based on Student's field of interests, Content creator or freelance writer, School newspaper editor or club president, Youth ambassador or Writing tutor for younger students.",
    content: <img src="/aes-creatorverse/writing.png" alt="Creative writing" className="w-full h-full object-cover" />,
  },
  {
    title: "Speaking",
    description:
      "Amplify your voice and inspire others with confident communication. Debate or public speaking team leader, Student council spokesperson or representative, Podcast or YouTube host, Delivers motivational talks, TED-style speeches, or event emceeing.",
    content: (
      <img src="/aes-creatorverse/speaking.png" alt="Speaking and presentation" className="w-full h-full object-cover" />
    ),
  },
  {
    title: "Leadership & Community",
    description:
      "Make an impact by leading and inspiring your community. Organizes community drives, campaigns, workshops, or fundraisers, Facilitates town halls, youth forums, or service projects, Club president or student council leader, Volunteer coordinator or outreach ambassador.",
    content: (
      <img src="/aes-creatorverse/leadership.png" alt="Leadership and community" className="w-full h-full object-cover" />
    ),
  },
]

export default function FocusSkillsSticky() {
  return <CreatorverseStickyScroll content={skillsContent} />
}


