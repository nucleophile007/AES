"use client"

import React from "react"
import Image from "next/image"
import { CreatorverseStickyScroll } from "./creatorverse-sticky-scroll"
import { BookOpen, Megaphone, Mic, PenTool } from "lucide-react"

const skillsContent = [
  {
    shortTitle: "R",
    sectionIcon: BookOpen,
    title: "Reading",
    description:
      "Develop your critical thinking and analytical skills while turning your reading habits into visible, meaningful opportunities.",
    content: (
      <div className="relative w-full h-full">
        <Image src="/aes-creatorverse/reading.png" alt="Reading and learning" fill className="object-cover" />
      </div>
    ),
  },
  {
    shortTitle: "W",
    sectionIcon: PenTool,
    title: "Writing",
    description:
      "Express your creativity and build a strong written voice through projects that match your interests and future goals.",
    content: (
      <div className="relative w-full h-full">
        <Image src="/aes-creatorverse/writing.png" alt="Creative writing" fill className="object-cover" />
      </div>
    ),
  },
  {
    shortTitle: "S",
    sectionIcon: Mic,
    title: "Speaking",
    description:
      "Amplify your voice and inspire others with confident communication, polished presentation skills, and public presence.",
    content: (
      <div className="relative w-full h-full">
        <Image src="/aes-creatorverse/speaking.png" alt="Speaking and presentation" fill className="object-cover" />
      </div>
    ),
  },
  {
    shortTitle: "L",
    sectionIcon: Megaphone,
    title: "Leadership & Community",
    description:
      "Make an impact by leading initiatives, organizing people, and creating visible value in your community.",
    content: (
      <div className="relative w-full h-full">
        <Image src="/aes-creatorverse/leadership.png" alt="Leadership and community" fill className="object-cover" />
      </div>
    ),
  },
]

export default function FocusSkillsSticky() {
  return <CreatorverseStickyScroll content={skillsContent} />
}
