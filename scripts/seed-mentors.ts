import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const faculty = [
    // Engineering & AI
    {
        name: "Dr. Shanti Swaroop Kandala",
        role: "Founder/CEO/Research Program Director",
        workplace: "ACHARYA Educational Services",
        education: "Ph.D. in Mechanical and Aerospace Engineering",
        institution: "Indian Institute of Technology Hyderabad, India",
        experience: "Research, Leadership & Educational Innovation",
        specialties: ["Mechanical Engineering", "Aerospace Engineering", "Research Program Development", "Educational Leadership", "Innovation & Mentoring"],
        achievements: ["Founder & CEO of ACHARYA Educational Services", "Research Program Director", "M.S. in Aerospace Engineering from KAIST, South Korea", "Master in Liberal Arts from Ashoka (UPenn), India"],
        bio: "Dr. Shanti Swaroop Kandala is the visionary founder and CEO of ACHARYA Educational Services, bringing extensive expertise in mechanical and aerospace engineering combined with a passion for educational excellence. With a Ph.D. from IIT Hyderabad, an M.S. from KAIST South Korea, and a Master in Liberal Arts from Ashoka (UPenn), he offers a unique interdisciplinary perspective. As Research Program Director, he guides students toward academic excellence while fostering innovation and critical thinking, bridging the gap between cutting-edge research and practical education.",
        image: "/founder-image.png",
        department: "engg-ai",
        isActive: true,
        displayOrder: 1,
    },
    {
        name: "Dr. Manasa Kandula",
        role: "Assistant Professor",
        workplace: "Academic Institution",
        education: "Ph.D. in Materials Science",
        institution: "University of Massachusetts Amherst, USA",
        experience: "Research & Teaching in Physics & Materials Science",
        specialties: ["Soft Condensed Matter", "Advanced Microscopy", "Biological Materials", "Materials Science Engineering"],
        achievements: ["Faculty Success Fellow 2024", "International research experience", "Undergraduate research mentor", "Interdisciplinary collaboration expert"],
        bio: "Assistant Professor specializing in Materials Science.",
        image: "/mk.png",
        department: "engg-ai",
        isActive: true,
        displayOrder: 2,
    },
    {
        name: "Dr. Rakesh Lingam",
        role: "Assistant Professor",
        workplace: "Indian Institute of Technology Dharwad, India",
        education: "Ph.D in Mechanical and Aerospace Engineering",
        institution: "Indian Institute of Technology Hyderabad, India",
        experience: "Research & Mentoring",
        specialties: ["Mechanical Engineering", "Aerospace Engineering", "Innovation Mentoring", "Youth Development"],
        achievements: ["Top engineering faculty", "Innovation advocate", "Youth mentor", "Future-ready education"],
        bio: "Assistant Professor specializing in Mechanical and Aerospace Engineering.",
        image: "/rakesh-lingam.png",
        department: "engg-ai",
        isActive: true,
        displayOrder: 3,
    },
    {
        name: "Dr. Konjengbam Anand",
        role: "Assistant Professor",
        workplace: "Indian Institute of Technology Dharwad, India",
        education: "Ph.D. in Computer Science & Engineering",
        institution: "Indian Institute of Technology Hyderabad, India",
        experience: "Research & Teaching in AI/ML",
        specialties: ["Natural Language Processing", "Sentiment Analysis", "Machine Translation", "Generative AI"],
        achievements: ["Suzuki Foundation Research Grant recipient", "IIT Hyderabad Research Excellence Award", "Text-to-Speech synthesis expert", "International research collaboration"],
        bio: "Assistant Professor specializing in AI/ML.",
        image: "/kjba.png",
        department: "engg-ai",
        isActive: true,
        displayOrder: 4,
    },
    {
        name: "Dr. Thejus R. Kartha",
        role: "Asst. Professor",
        workplace: "Academic Institution",
        education: "Ph.D in Computational Chemistry",
        institution: "Indian Institute of Technology Hyderabad, India",
        experience: "Research & Teaching",
        specialties: ["Data Science", "AI/ML", "Infrared Signal Processing", "Computational Chemistry"],
        achievements: ["Data-driven solutions expert", "AI/ML lecturer", "Science education advocate", "Arts enthusiast"],
        bio: "Asst. Professor specializing in Computational Chemistry.",
        image: "/thejus-r-kartha.png",
        department: "engg-ai",
        isActive: true,
        displayOrder: 5,
    },
    // Pre-Med, BIO & CHEM
    {
        name: "Dr. Sudharshan",
        role: "Research Mentor & STEM Educator",
        workplace: "ACHARYA Educational Services",
        education: "Ph.D. in Cell Biology",
        institution: "Research University",
        experience: "Research & Teaching in Stem Cell Biology & Regenerative Medicine",
        specialties: ["Stem Cell Biology", "iPSC Technology", "Organoid Development", "CRISPR-Cas9 Gene Editing", "Precision Medicine", "Tissue Engineering"],
        achievements: ["Induced pluripotent stem cell (iPSC) technology expert", "Organoid development specialist", "Translational applications in regenerative medicine", "Drug discovery research", "Molecular characterization expertise", "Mentoring next generation of STEM students"],
        bio: "I hold a Ph.D. in Cell Biology with a primary research focus on stem cell biology, particularly induced pluripotent stem cell (iPSC) technology, organoid development, and their translational applications in regenerative medicine and drug discovery. My background includes CRISPR-Cas9 gene editing and molecular characterization, which provide a strong foundation for exploring precision medicine and tissue engineering. At ACHARYA, I intend to apply my expertise, together with ongoing teaching initiatives, to cultivate curiosity and strengthen scientific aptitude among students. Additionally, I aim to mentor students and emerging scientific minds to ignite a passion for science that aligns with ACHARYA's mission of educating the next generation of STEM students and fostering a deeper understanding of science.",
        image: "/sudharshan.png",
        department: "premed-bio-chem",
        isActive: true,
        displayOrder: 6,
    },
    // Law, Humanities & Social Sciences
    {
        name: "Bhavya Sree Kandala",
        role: "Criminal Defense & Family Law Attorney",
        workplace: "Private Practice, Washington State",
        education: "Master of Laws (LLM)",
        institution: "Seattle University School of Law, Washington State, USA",
        experience: "Criminal Defense & Family Law Practice",
        specialties: ["Family Law", "Criminal Defense", "Divorce & Child Custody", "DUI & Traffic Defense"],
        achievements: ["Licensed Washington State Attorney", "Comprehensive litigation expertise", "Client-centered legal advocacy", "Compassionate legal representation"],
        bio: "Criminal Defense & Family Law Attorney.",
        image: "/bhavya-kandala.png",
        department: "law-humanities",
        isActive: true,
        displayOrder: 7,
    },
    {
        name: "Prathyusha",
        role: "Anthropology & Social Research Specialist",
        workplace: "Research Consultant & Educator",
        education: "Advanced Studies in Anthropology",
        institution: "Research & Academic Institution",
        experience: "Social Research, Human Factors & User-Centered Design",
        specialties: ["Anthropology", "Sociology", "Social Research", "Critical Thinking", "Academic Writing", "Research Methods"],
        achievements: ["Experience with global tech leaders", "Social development projects", "NGO collaborations", "User-centered research & design"],
        bio: "I'm an experienced researcher and passionate educator with a strong academic foundation in Anthropology and professional experience spanning social research, human factors, and user-centered research & design. Having the opportunity of working with organizations ranging from global tech leaders to social development projects and NGOs, I have developed a broad, applied perspective on the subjects I teach. Whether it's breaking down sociological theories into digestible content, guiding research projects & essays, or helping students sharpen their critical thinking and writing skills in general, I bring both academic knowledge and professional insight to every session that is essential for success at top universities. Beyond tutoring, I see myself as a mentor who helps students make meaningful connections between classroom learning and the world beyond, preparing them for both academic excellence and lifelong learning.",
        image: "/prathyusa_image.jpg",
        department: "law-humanities",
        isActive: true,
        displayOrder: 8,
    },
    // Associate Mentors
    {
        name: "Aneesh Bhardwaj",
        role: "Mathematics Tutor & Speech & Debate Coach",
        workplace: "ACHARYA Educational Services",
        education: "B.Tech in Computer Engineering (3rd year undergraduate)",
        institution: "UC Davis, USA",
        experience: "Mathematics Tutoring & Speech & Debate Coaching",
        specialties: ["IM1-IM3 Mathematics", "Precalculus", "Speech & Debate", "Analytical Problem Solving"],
        achievements: ["6 years speech & debate experience", "National tournament competitor", "Science fair presenter", "Community mentor"],
        bio: "Mathematics Tutor & Speech & Debate Coach.",
        image: "/aneesh.png",
        department: "associate",
        isActive: true,
        displayOrder: 9,
    },
];

async function main() {
    console.log("Seeding mentors...");

    // First, verify the Mentor model has the 'department' field
    // by checking if we can query it (implicitly handled by TS if generated, or runtime error if not)

    for (const mentor of faculty) {
        const existing = await prisma.mentor.findFirst({
            where: { name: mentor.name },
        });

        if (!existing) {
            await prisma.mentor.create({
                data: {
                    ...mentor,
                    updatedAt: new Date(),
                },
            });
            console.log(`Created: ${mentor.name}`);
        } else {
            await prisma.mentor.update({
                where: { id: existing.id },
                data: {
                    ...mentor,
                    updatedAt: new Date(),
                },
            });
            console.log(`Updated: ${mentor.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
